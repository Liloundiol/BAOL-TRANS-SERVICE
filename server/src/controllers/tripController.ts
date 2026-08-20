import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departure, destination, date, page = 1, limit = 50 } = req.query;

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 50;
    const skip = (pageNumber - 1) * pageSize;

    const whereClause: any = {
      status: 'ACTIVE'
    };

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
                where: { status: { not: 'CANCELLED' } },
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

    res.json({ 
      success: true, 
      trips: formattedTrips,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
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
              where: { status: { not: 'CANCELLED' } }
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
    const { departure, destination, date, time, price, boardingPoints, dropoffPoints } = req.body;

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        departure,
        destination,
        date: date ? new Date(date) : undefined,
        time: time ? new Date(`${date?.split('T')[0] || new Date().toISOString().split('T')[0]}T${time}:00Z`) : undefined,
        price: price ? parseFloat(price) : undefined,
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

    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    // Soft delete: Change status to ARCHIVED instead of deleting records
    // This preserves all reservations, tickets, and financial data for history
    await prisma.trip.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    res.json({ success: true, message: 'Le trajet a été archivé avec succès et l\'historique est conservé.' });
  } catch (error) {
    next(error);
  }
};
