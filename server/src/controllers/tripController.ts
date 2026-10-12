import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import NodeCache from 'node-cache';

const tripCache = new NodeCache({ stdTTL: 30 }); // Cache de 30 secondes pour les trajets

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departure, destination, date, status, page = 1, limit = 50 } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 50;
    const skip = (pageNumber - 1) * pageSize;
    
    const cacheKey = `trips_${departure || 'all'}_${destination || 'all'}_${date || 'all'}_${status || 'default'}_${pageNumber}_${pageSize}`;
    const cachedResponse = tripCache.get(cacheKey);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const whereClause: any = {};
    if (status && status !== 'ALL' && status !== 'all') {
      whereClause.status = status as string;
    } else if (!status) {
      whereClause.status = 'ACTIVE';
    }

    if (departure) {
      whereClause.departure = { contains: departure as string, mode: 'insensitive' };
    }
    
    if (destination) {
      whereClause.destination = { contains: destination as string, mode: 'insensitive' };
    }

    if (date) {
      // Very basic date filtering
      whereClause.date = new Date(date as string);
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          boardingPoints: true,
          dropoffPoints: true,
          buses: {
            include: {
              reservations: {
                where: { status: 'PAID' },
                select: { id: true, seatNumber: true } // Optimisation
              }
            }
          }
        },
        orderBy: {
          time: 'asc'
        }
      }),
      prisma.trip.count({ where: whereClause })
    ]);

    // Format the response to calculate available seats
    const formattedTrips = trips.map(trip => {
      // Calculate total capacity and occupied seats across all buses for this trip
      let totalCapacity = 0;
      let totalOccupied = 0;

      trip.buses.forEach(bus => {
        totalCapacity += bus.capacity;
        totalOccupied += bus.reservations.length;
      });

      return {
        id: trip.id,
        departure: trip.departure,
        destination: trip.destination,
        date: trip.date,
        time: trip.time,
        price: trip.price,
        availableSeats: totalCapacity - totalOccupied,
        status: trip.status,
        boardingPoints: trip.boardingPoints,
        dropoffPoints: trip.dropoffPoints
      };
    });

    const responseData = { 
      success: true, 
      trips: formattedTrips,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
    
    tripCache.set(cacheKey, responseData);
    res.json(responseData);
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const { departure, destination, date, time, price, capacity, boardingPoints, dropoffPoints } = req.body;

    if (!departure || !destination || !date || !time || !price) {
      return res.status(400).json({ success: false, error: 'Tous les champs sont requis' });
    }

    // Convert date string to Date object
    const tripDate = new Date(date);
    
    // Convert time string to a proper Date object for PostgreSQL Time type
    // We just need the time part, but Prisma DateTime expects a full ISO string. 
    // We'll create a dummy date with the correct time.
    const [hours, minutes] = time.split(':');
    const tripTime = new Date(1970, 0, 1, parseInt(hours), parseInt(minutes), 0);

    // Create the trip and its first bus in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          departure,
          destination,
          date: tripDate,
          time: tripTime,
          price: parseFloat(price),
          boardingPoints: boardingPoints && Array.isArray(boardingPoints) ? {
            create: boardingPoints.map((bp: any) => ({
              name: bp.name,
              time: bp.time
            }))
          } : undefined,
          dropoffPoints: dropoffPoints && Array.isArray(dropoffPoints) ? {
            create: dropoffPoints.map((dp: any) => ({
              name: dp.name,
              time: dp.time
            }))
          } : undefined
        }
      });

      // Generate a unique bus number like BUS-1234
      const busNumber = `BUS-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBus = await tx.bus.create({
        data: {
          tripId: newTrip.id,
          busNumber,
          capacity: capacity ? parseInt(capacity) : 13,
          status: 'AVAILABLE'
        }
      });

      return { trip: newTrip, bus: newBus };
    });

    tripCache.flushAll();

    res.status(201).json({ 
      success: true, 
      trip: result.trip,
      bus: result.bus
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        boardingPoints: true,
        dropoffPoints: true,
        buses: {
          include: {
            reservations: {
              where: { status: 'PAID' }
            }
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trajet non trouvé' });
    }

    let totalCapacity = 0;
    let totalOccupied = 0;

    trip.buses.forEach((bus: any) => {
      totalCapacity += bus.capacity;
      totalOccupied += bus.reservations.length;
    });

    let activeBus = trip.buses.find((b: any) => b.status === 'AVAILABLE');
    let occupiedSeats: number[] = [];
    
    if (activeBus) {
      occupiedSeats = activeBus.reservations.map((r: any) => r.seatNumber);
    }

    res.json({
      success: true,
      trip: {
        id: trip.id,
        departure: trip.departure,
        destination: trip.destination,
        date: trip.date,
        time: trip.time,
        price: trip.price,
        availableSeats: totalCapacity - totalOccupied,
        status: trip.status,
        boardingPoints: trip.boardingPoints,
        dropoffPoints: trip.dropoffPoints,
        activeBusId: activeBus?.id,
        capacity: activeBus?.capacity || 13,
        occupiedSeats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { departure, destination, date, time, price, status, boardingPoints, dropoffPoints } = req.body;

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        departure,
        destination,
        date: date ? new Date(date) : undefined,
        time: time ? new Date(`${date?.split('T')[0] || new Date().toISOString().split('T')[0]}T${time}:00Z`) : undefined,
        price: price ? parseFloat(price) : undefined,
        status: status ? status : undefined,
        boardingPoints: boardingPoints && Array.isArray(boardingPoints) ? {
          deleteMany: {},
          create: boardingPoints.map((bp: any) => ({
            name: bp.name,
            time: bp.time
          }))
        } : undefined,
        dropoffPoints: dropoffPoints && Array.isArray(dropoffPoints) ? {
          deleteMany: {},
          create: dropoffPoints.map((dp: any) => ({
            name: dp.name,
            time: dp.time
          }))
        } : undefined
      }
    });

    tripCache.flushAll();

    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

export const toggleTripStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const existingTrip = await prisma.trip.findUnique({
      where: { id }
    });

    if (!existingTrip) {
      return res.status(404).json({ success: false, error: 'Trajet non trouvé' });
    }

    // If explicit status provided, use it. Otherwise toggle between ACTIVE and CANCELLED
    let newStatus = status;
    if (!newStatus) {
      newStatus = existingTrip.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { status: newStatus }
    });

    tripCache.flushAll();

    const isActivated = updatedTrip.status === 'ACTIVE';
    res.json({
      success: true,
      trip: updatedTrip,
      message: isActivated ? 'Le trajet a été activé avec succès.' : 'Le trajet a été désactivé avec succès.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    // Check if trip has reservations or packages
    const [reservationsCount, packagesCount] = await Promise.all([
      prisma.reservation.count({
        where: { bus: { tripId: id } }
      }),
      prisma.package.count({
        where: { tripId: id }
      })
    ]);

    if (reservationsCount > 0 || packagesCount > 0) {
      // Soft delete: Change status to ARCHIVED instead of deleting records
      // This preserves all reservations, tickets, and financial data for history
      const archivedTrip = await prisma.trip.update({
        where: { id },
        data: { status: 'ARCHIVED' }
      });

      tripCache.flushAll();

      return res.json({ 
        success: true, 
        action: 'ARCHIVED',
        trip: archivedTrip,
        message: `Le trajet est associé à ${reservationsCount} réservation(s) et ${packagesCount} colis. Il a été archivé pour préserver l'historique et la comptabilité.` 
      });
    }

    // No reservations or packages: safely delete buses and trip in transaction
    await prisma.$transaction([
      prisma.boardingPoint.deleteMany({ where: { tripId: id } }),
      prisma.dropoffPoint.deleteMany({ where: { tripId: id } }),
      prisma.bus.deleteMany({ where: { tripId: id } }),
      prisma.trip.delete({ where: { id } })
    ]);

    tripCache.flushAll();

    res.json({ 
      success: true, 
      action: 'DELETED',
      message: 'Le trajet a été supprimé définitivement avec succès.' 
    });
  } catch (error) {
    next(error);
  }
};
