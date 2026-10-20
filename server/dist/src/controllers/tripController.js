"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTrip = exports.toggleTripStatus = exports.updateTrip = exports.getTripById = exports.createTrip = exports.getTrips = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const node_cache_1 = __importDefault(require("node-cache"));
const tripCache = new node_cache_1.default({ stdTTL: 30 }); // Cache de 30 secondes pour les trajets
const getTrips = async (req, res, next) => {
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
        const whereClause = {};
        if (status && status !== 'ALL' && status !== 'all') {
            whereClause.status = status;
        }
        else if (!status) {
            whereClause.status = 'ACTIVE';
        }
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
        const [trips, total] = await Promise.all([
            prisma_1.default.trip.findMany({
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
            prisma_1.default.trip.count({ where: whereClause })
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
        const result = await prisma_1.default.$transaction(async (tx) => {
            const newTrip = await tx.trip.create({
                data: {
                    departure,
                    destination,
                    date: tripDate,
                    time: tripTime,
                    price: parseFloat(price),
                    boardingPoints: boardingPoints && Array.isArray(boardingPoints) ? {
                        create: boardingPoints.map((bp) => ({
                            name: bp.name,
                            time: bp.time
                        }))
                    } : undefined,
                    dropoffPoints: dropoffPoints && Array.isArray(dropoffPoints) ? {
                        create: dropoffPoints.map((dp) => ({
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
                dropoffPoints: trip.dropoffPoints,
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
        const { departure, destination, date, time, price, status, boardingPoints, dropoffPoints } = req.body;
        const trip = await prisma_1.default.trip.update({
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
                    create: boardingPoints.map((bp) => ({
                        name: bp.name,
                        time: bp.time
                    }))
                } : undefined,
                dropoffPoints: dropoffPoints && Array.isArray(dropoffPoints) ? {
                    deleteMany: {},
                    create: dropoffPoints.map((dp) => ({
                        name: dp.name,
                        time: dp.time
                    }))
                } : undefined
            }
        });
        tripCache.flushAll();
        res.json({ success: true, trip });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTrip = updateTrip;
const toggleTripStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const existingTrip = await prisma_1.default.trip.findUnique({
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
        const updatedTrip = await prisma_1.default.trip.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.toggleTripStatus = toggleTripStatus;
const deleteTrip = async (req, res, next) => {
    try {
        const id = req.params.id;
        const force = req.query.force === 'true' || req.body?.force === true;
        const action = req.query.action || req.body?.action;
        // Check if trip exists
        const trip = await prisma_1.default.trip.findUnique({
            where: { id },
            include: {
                buses: { select: { id: true } },
                packages: { select: { id: true } }
            }
        });
        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trajet non trouvé' });
        }
        const busIds = trip.buses.map(b => b.id);
        const packageIds = trip.packages.map(p => p.id);
        const [reservations, packagesCount] = await Promise.all([
            prisma_1.default.reservation.findMany({
                where: { busId: { in: busIds } },
                select: { id: true }
            }),
            prisma_1.default.package.count({
                where: { tripId: id }
            })
        ]);
        const reservationIds = reservations.map(r => r.id);
        const reservationsCount = reservationIds.length;
        // If explicit archive requested
        if (action === 'ARCHIVE') {
            const archivedTrip = await prisma_1.default.trip.update({
                where: { id },
                data: { status: 'ARCHIVED' }
            });
            tripCache.flushAll();
            return res.json({
                success: true,
                action: 'ARCHIVED',
                trip: archivedTrip,
                message: `Le trajet a été archivé avec succès (${reservationsCount} réservation(s) et ${packagesCount} colis conservés).`
            });
        }
        // If there are reservations or packages and force is NOT set
        if (!force && (reservationsCount > 0 || packagesCount > 0)) {
            return res.status(409).json({
                success: false,
                requiresConfirmation: true,
                reservationsCount,
                packagesCount,
                error: `Ce trajet contient ${reservationsCount} réservation(s) et ${packagesCount} colis.`
            });
        }
        // Force delete OR no dependent records: delete cascade safely
        await prisma_1.default.$transaction(async (tx) => {
            // 1. Delete complaints linked to packages
            if (packageIds.length > 0) {
                await tx.complaint.deleteMany({ where: { packageId: { in: packageIds } } });
            }
            // 2. Delete payments linked to reservations or packages
            if (reservationIds.length > 0 || packageIds.length > 0) {
                await tx.payment.deleteMany({
                    where: {
                        OR: [
                            ...(reservationIds.length > 0 ? [{ reservationId: { in: reservationIds } }] : []),
                            ...(packageIds.length > 0 ? [{ packageId: { in: packageIds } }] : [])
                        ]
                    }
                });
            }
            // 3. Delete tickets linked to reservations
            if (reservationIds.length > 0) {
                await tx.ticket.deleteMany({ where: { reservationId: { in: reservationIds } } });
            }
            // 4. Delete reservations
            if (reservationIds.length > 0) {
                await tx.reservation.deleteMany({ where: { id: { in: reservationIds } } });
            }
            // 5. Delete packages
            if (packageIds.length > 0) {
                await tx.package.deleteMany({ where: { id: { in: packageIds } } });
            }
            // 6. Delete boarding points and dropoff points
            await tx.boardingPoint.deleteMany({ where: { tripId: id } });
            await tx.dropoffPoint.deleteMany({ where: { tripId: id } });
            // 7. Delete buses
            await tx.bus.deleteMany({ where: { tripId: id } });
            // 8. Delete trip
            await tx.trip.delete({ where: { id } });
        });
        tripCache.flushAll();
        return res.json({
            success: true,
            action: 'DELETED',
            message: 'Le trajet a été définitivement supprimé de la base de données.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTrip = deleteTrip;
