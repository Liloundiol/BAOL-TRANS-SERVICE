"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBus = exports.updateBus = exports.createBus = exports.getAllBuses = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllBuses = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const buses = await prisma_1.default.bus.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBuses = getAllBuses;
const createBus = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const { tripId, busNumber, capacity } = req.body;
        if (!tripId || !busNumber) {
            return res.status(400).json({ success: false, error: 'tripId et busNumber sont requis' });
        }
        // Verify trip exists
        const trip = await prisma_1.default.trip.findUnique({ where: { id: tripId } });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trajet non trouvé' });
        }
        const newBus = await prisma_1.default.bus.create({
            data: {
                tripId,
                busNumber,
                capacity: capacity ? parseInt(capacity.toString()) : 13,
                status: 'AVAILABLE'
            }
        });
        res.status(201).json({ success: true, bus: newBus });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'Un bus avec ce numéro existe déjà' });
        }
        next(error);
    }
};
exports.createBus = createBus;
const updateBus = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const id = req.params.id;
        const { busNumber, capacity, status, tripId } = req.body;
        const bus = await prisma_1.default.bus.update({
            where: { id },
            data: {
                ...(busNumber && { busNumber }),
                ...(capacity && { capacity: parseInt(capacity.toString()) }),
                ...(status && { status }),
                ...(tripId && { tripId })
            }
        });
        res.json({ success: true, bus });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: 'Ce numéro de bus est déjà utilisé' });
        }
        next(error);
    }
};
exports.updateBus = updateBus;
const deleteBus = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const id = req.params.id;
        // Check for reservations
        const reservationsCount = await prisma_1.default.reservation.count({
            where: { busId: id, status: { not: 'CANCELLED' } }
        });
        if (reservationsCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Impossible de supprimer ce bus : il contient déjà des réservations actives.'
            });
        }
        await prisma_1.default.bus.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Bus supprimé avec succès' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBus = deleteBus;
