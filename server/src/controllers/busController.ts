import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../config/prisma';

export const getAllBuses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const buses = await prisma.bus.findMany({
      include: {
        trip: true,
        reservations: {
          where: { status: { not: 'CANCELLED' } }
        }
      },
      orderBy: {
        busNumber: 'asc'
      }
    });

    const formattedBuses = buses.map(bus => ({
      id: bus.id,
      busNumber: bus.busNumber,
      trip: `${bus.trip.departure} → ${bus.trip.destination}`,
      capacity: bus.capacity,
      occupied: bus.reservations.length,
      status: bus.status
    }));

    res.json({ success: true, buses: formattedBuses });
  } catch (error) {
    next(error);
  }
};

export const createBus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const { tripId, busNumber, capacity } = req.body;

    if (!tripId || !busNumber) {
      return res.status(400).json({ success: false, error: 'tripId et busNumber sont requis' });
    }

    // Verify trip exists
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trajet non trouvé' });
    }

    const newBus = await prisma.bus.create({
      data: {
        tripId,
        busNumber,
        capacity: capacity ? parseInt(capacity.toString()) : 13,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({ success: true, bus: newBus });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Un bus avec ce numéro existe déjà' });
    }
    next(error);
  }
};

export const updateBus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const id = req.params.id as string;
    const { busNumber, capacity, status, tripId } = req.body;

    const bus = await prisma.bus.update({
      where: { id },
      data: {
        ...(busNumber && { busNumber }),
        ...(capacity && { capacity: parseInt(capacity.toString()) }),
        ...(status && { status }),
        ...(tripId && { tripId })
      }
    });

    res.json({ success: true, bus });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'Ce numéro de bus est déjà utilisé' });
    }
    next(error);
  }
};

export const deleteBus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Accès non autorisé' });
    }

    const id = req.params.id as string;

    // Check for reservations
    const reservationsCount = await prisma.reservation.count({
      where: { busId: id, status: { not: 'CANCELLED' } }
    });

    if (reservationsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Impossible de supprimer ce bus : il contient déjà des réservations actives.' 
      });
    }

    await prisma.bus.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Bus supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
