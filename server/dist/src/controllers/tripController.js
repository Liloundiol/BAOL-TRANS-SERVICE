"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrip = exports.updateTrip = exports.getTripById = exports.createTrip = exports.getTrips = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getTrips = async (req, res, next) => {
    try {
        const { departure, destination, date } = req.query;
        const whereClause = {
            status: 'ACTIVE'
        };
        if (departure) {
            whereClause.departure = { contains: departure, mode: 'insensitive' };
        }
        if (destination) {
            whereClause.destination = { contains: destination, mode: 'insensitive' };
        }
        if (date) {
            // Very basic date filtering
            whereClause.date = new Date(date);
        }
        const trips = await prisma_1.default.trip.findMany({
            where: whereClause,
            include: {
                boardingPoints: true,
                buses: {
                    include: {
                        reservations: {
                            where: { status: { not: 'CANCELLED' } }
                        }
                    }
                }
            },
            orderBy: {
                time: 'asc'
            }
        });
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
                boardingPoints: trip.boardingPoints
            };
        });
        res.json({ success: true, trips: formattedTrips });
    }
    catch (error) {
        next(error);
    }
};
exports.getTrips = getTrips;
const createTrip = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const { departure, destination, date, time, price, capacity, boardingPoints } = req.body;
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
        const result = await prisma_1.default.$transaction(async (tx) => {
            const newTrip = await tx.trip.create({
                data: {
                    departure,
                    destination,
                    date: tripDate,
                    time: tripTime,
                    price: parseFloat(price),
                    boardingPoints: boardingPoints && Array.isArray(boardingPoints) ? {
                        create: boardingPoints.map(bp => ({
                            name: bp.name,
                            time: bp.time
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
    }
    catch (error) {
        next(error);
    }
};
exports.createTrip = createTrip;
const getTripById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const trip = await prisma_1.default.trip.findUnique({
            where: { id },
            include: {
                boardingPoints: true,
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
        trip.buses.forEach((bus) => {
            totalCapacity += bus.capacity;
            totalOccupied += bus.reservations.length;
        });
        let activeBus = trip.buses.find((b) => b.status === 'AVAILABLE');
        let occupiedSeats = [];
        if (activeBus) {
            occupiedSeats = activeBus.reservations.map((r) => r.seatNumber);
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
                activeBusId: activeBus?.id,
                capacity: activeBus?.capacity || 13,
                occupiedSeats
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTripById = getTripById;
const updateTrip = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { departure, destination, date, time, price } = req.body;
        const trip = await prisma_1.default.trip.update({
            where: { id },
            data: {
                departure,
                destination,
                date: date ? new Date(date) : undefined,
                time: time ? new Date(`${date?.split('T')[0] || new Date().toISOString().split('T')[0]}T${time}:00Z`) : undefined,
                price,
            }
        });
        res.json({ success: true, trip });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTrip = updateTrip;
const deleteTrip = async (req, res, next) => {
    try {
        const id = req.params.id;
        // Soft delete: Change status to ARCHIVED instead of deleting records
        // This preserves all reservations, tickets, and financial data for history
        await prisma_1.default.trip.update({
            where: { id },
            data: { status: 'ARCHIVED' }
        });
        res.json({ success: true, message: 'Le trajet a été archivé avec succès et l\'historique est conservé.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTrip = deleteTrip;
