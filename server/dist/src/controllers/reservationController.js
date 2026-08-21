"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReservation = exports.uploadProof = exports.markTicketAsUsed = exports.updateReservationStatus = exports.getTicketByCode = exports.getAllReservations = exports.getMyReservations = exports.payReservation = exports.initiatePayment = exports.createReservation = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const notificationService_1 = require("../services/notificationService");
const paymentService_1 = require("../services/paymentService");
const loyaltyService_1 = require("../services/loyaltyService");
const createReservation = async (req, res, next) => {
    try {
        const { tripId, boardingPoint, dropoffPoint, seatNumber, paymentProofUrl } = req.body;
        const userId = req.user.userId;
        if (!tripId) {
            return res.status(400).json({ success: false, error: 'tripId requis' });
        }
        const trip = await prisma_1.default.trip.findUnique({
            where: { id: tripId },
            include: {
                buses: {
                    include: {
                        reservations: {
                            where: { status: { not: 'CANCELLED' } }
                        }
                    }
                }
            }
        });
        if (!trip || trip.status !== 'ACTIVE') {
            return res.status(404).json({ success: false, error: 'Trajet non trouvé ou inactif' });
        }
        let assignedBusId = null;
        let assignedSeat = null;
        for (const bus of trip.buses) {
            if (bus.status === 'AVAILABLE') {
                const occupiedSeats = bus.reservations.map(r => r.seatNumber);
                if (seatNumber) {
                    const requestedSeat = parseInt(seatNumber, 10);
                    if (!occupiedSeats.includes(requestedSeat) && requestedSeat >= 1 && requestedSeat <= bus.capacity) {
                        assignedBusId = bus.id;
                        assignedSeat = requestedSeat;
                        break;
                    }
                    else {
                        return res.status(400).json({ success: false, error: 'Le siège sélectionné est déjà occupé ou invalide' });
                    }
                }
                else {
                    for (let i = 1; i <= bus.capacity; i++) {
                        if (!occupiedSeats.includes(i)) {
                            assignedBusId = bus.id;
                            assignedSeat = i;
                            break;
                        }
                    }
                    if (assignedBusId)
                        break;
                }
            }
        }
        if (!assignedBusId || !assignedSeat) {
            return res.status(400).json({ success: false, error: 'Aucune place disponible pour ce trajet' });
        }
        const reservation = await prisma_1.default.reservation.create({
            data: {
                userId,
                busId: assignedBusId,
                seatNumber: assignedSeat,
                boardingPoint,
                dropoffPoint,
                paymentProofUrl,
                status: 'PENDING'
            }
        });
        const updatedBus = await prisma_1.default.bus.findUnique({
            where: { id: assignedBusId },
            include: { reservations: { where: { status: { not: 'CANCELLED' } } } }
        });
        if (updatedBus && updatedBus.reservations.length >= updatedBus.capacity) {
            await prisma_1.default.bus.update({
                where: { id: assignedBusId },
                data: { status: 'FULL' }
            });
            await prisma_1.default.bus.create({
                data: {
                    tripId: trip.id,
                    busNumber: `BTS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                    capacity: 13,
                    status: 'AVAILABLE'
                }
            });
        }
        const admins = await prisma_1.default.user.findMany({ where: { role: 'ADMIN' } });
        if (admins.length > 0) {
            await prisma_1.default.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: 'Nouvelle Réservation',
                    message: `Nouvelle réservation en attente pour le trajet ${trip.departure} -> ${trip.destination}`,
                    type: 'IN_APP'
                }))
            });
        }
        res.status(201).json({ success: true, reservation });
    }
    catch (error) {
        next(error);
    }
};
exports.createReservation = createReservation;
const initiatePayment = async (req, res, next) => {
    try {
        const { reservationId } = req.body;
        const userId = req.user.userId;
        const reservation = await prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: { bus: { include: { trip: true } }, user: true }
        });
        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
        }
        if (reservation.userId !== userId) {
            return res.status(403).json({ success: false, error: 'Action non autorisée' });
        }
        if (reservation.status !== 'PENDING') {
            return res.status(400).json({ success: false, error: 'La réservation n\'est pas en attente de paiement' });
        }
        // Initialize payment session with Wave
        const amount = Number(reservation.bus.trip.price);
        const paymentSession = await paymentService_1.paymentService.createPaymentSession(amount, reservationId, reservation.user.phoneNumber);
        if (!paymentSession.success) {
            return res.status(500).json({ success: false, error: 'Impossible d\'initialiser le paiement avec Wave' });
        }
        res.json({ success: true, paymentUrl: paymentSession.paymentUrl, sessionId: paymentSession.sessionId });
    }
    catch (error) {
        next(error);
    }
};
exports.initiatePayment = initiatePayment;
const payReservation = async (req, res, next) => {
    try {
        const { reservationId, waveTransactionId, amount } = req.body;
        const userId = req.user.userId;
        const reservation = await prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: { bus: { include: { trip: true } } }
        });
        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
        }
        if (reservation.userId !== userId) {
            return res.status(403).json({ success: false, error: 'Action non autorisée' });
        }
        if (reservation.status !== 'PENDING') {
            return res.status(400).json({ success: false, error: "La réservation n'est pas en attente de paiement" });
        }
        // waveTransactionId here represents the checkout Session ID in real scenarios
        const verification = await paymentService_1.paymentService.verifyPayment(waveTransactionId);
        if (!verification.success || verification.status !== 'completed') {
            return res.status(400).json({ success: false, error: "Le paiement n'a pas encore été validé par Wave" });
        }
        let createdTicket;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.payment.create({
                data: {
                    reservationId,
                    waveTransactionId,
                    amount: amount || reservation.bus.trip.price,
                    status: 'COMPLETED'
                }
            });
            await tx.reservation.update({
                where: { id: reservationId },
                data: { status: 'PAID' }
            });
            const ticketCode = `TKT-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
            createdTicket = await tx.ticket.create({
                data: {
                    reservationId,
                    ticketCode,
                    qrCodeData: JSON.stringify({ reservationId, ticketCode })
                }
            });
        });
        const admins = await prisma_1.default.user.findMany({ where: { role: 'ADMIN' } });
        if (admins.length > 0) {
            await prisma_1.default.notification.createMany({
                data: admins.map(admin => ({
                    userId: admin.id,
                    title: 'Paiement Reçu',
                    message: `Paiement validé pour la réservation de ${reservation.bus.trip.departure} -> ${reservation.bus.trip.destination}`,
                    type: 'IN_APP'
                }))
            });
        }
        // --- ENVOI DES NOTIFICATIONS CLIENT (EMAIL ET SMS) ---
        // Fetch the full reservation with user details to send emails
        const fullReservation = await prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                user: true,
                bus: { include: { trip: true } }
            }
        });
        if (fullReservation && createdTicket) {
            await (0, notificationService_1.sendTicketEmail)(fullReservation.user, createdTicket, fullReservation);
            await (0, notificationService_1.sendTicketSMS)(fullReservation.user, createdTicket, fullReservation);
            // Add 10 loyalty points
            await (0, loyaltyService_1.addLoyaltyPoints)(fullReservation.userId, 10, `Réservation confirmée : ${fullReservation.bus.trip.departure} -> ${fullReservation.bus.trip.destination}`);
        }
        res.json({ success: true, message: 'Paiement effectué avec succès et billet généré', ticket: createdTicket });
    }
    catch (error) {
        next(error);
    }
};
exports.payReservation = payReservation;
const getMyReservations = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 20;
        const skip = (pageNumber - 1) * pageSize;
        const [reservations, total] = await Promise.all([
            prisma_1.default.reservation.findMany({
                where: { userId },
                skip,
                take: pageSize,
                include: {
                    bus: {
                        include: { trip: true }
                    },
                    ticket: true,
                    payment: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.reservation.count({ where: { userId } })
        ]);
        res.json({
            success: true,
            reservations,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyReservations = getMyReservations;
const getAllReservations = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN' && req.user.role !== 'AGENT') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const { page = 1, limit = 50, status } = req.query;
        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 50;
        const skip = (pageNumber - 1) * pageSize;
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        const [reservations, total] = await Promise.all([
            prisma_1.default.reservation.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true } },
                    bus: {
                        include: { trip: { select: { departure: true, destination: true, date: true, time: true, price: true } } }
                    },
                    ticket: { select: { ticketCode: true, isUsed: true } },
                    payment: { select: { status: true, amount: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.default.reservation.count({ where: whereClause })
        ]);
        res.json({
            success: true,
            reservations,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReservations = getAllReservations;
const getTicketByCode = async (req, res, next) => {
    try {
        const ticketCode = req.params.ticketCode;
        const ticket = await prisma_1.default.ticket.findUnique({
            where: { ticketCode },
            include: {
                reservation: {
                    include: {
                        user: true,
                        bus: { include: { trip: true } }
                    }
                }
            }
        });
        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Billet non trouvé' });
        }
        const isOwner = req.user.userId === ticket.reservation.userId;
        const isAdminOrStaff = ['ADMIN', 'AGENT', 'CONTROLLER'].includes(req.user.role);
        if (!isOwner && !isAdminOrStaff) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        res.json({ success: true, ticket });
    }
    catch (error) {
        next(error);
    }
};
exports.getTicketByCode = getTicketByCode;
const updateReservationStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const existingReservation = await prisma_1.default.reservation.findUnique({
            where: { id },
            include: { ticket: true, bus: { include: { trip: true } } }
        });
        if (!existingReservation) {
            return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
        }
        if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Statut invalide' });
        }
        let reservation;
        if (status === 'PAID' && existingReservation.status !== 'PAID') {
            // Admin is manually validating payment
            reservation = await prisma_1.default.$transaction(async (tx) => {
                const updated = await tx.reservation.update({
                    where: { id },
                    data: { status: 'PAID' }
                });
                // Create mock cash payment
                await tx.payment.create({
                    data: {
                        reservationId: id,
                        waveTransactionId: 'CASH-ADMIN-' + Math.floor(Math.random() * 1000000),
                        amount: existingReservation.bus.trip.price,
                        status: 'COMPLETED'
                    }
                });
                // Create ticket
                const ticketCode = `TKT-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
                const createdTicket = await tx.ticket.create({
                    data: {
                        reservationId: id,
                        ticketCode,
                        qrCodeData: JSON.stringify({ reservationId: id, ticketCode })
                    }
                });
                return { updated, createdTicket };
            });
            const createdTicket = reservation.createdTicket;
            reservation = reservation.updated;
            // Send SMS and Email after transaction
            const fullReservation = await prisma_1.default.reservation.findUnique({
                where: { id },
                include: {
                    user: true,
                    bus: { include: { trip: true } }
                }
            });
            if (fullReservation && createdTicket) {
                await (0, notificationService_1.sendTicketEmail)(fullReservation.user, createdTicket, fullReservation);
                await (0, notificationService_1.sendTicketSMS)(fullReservation.user, createdTicket, fullReservation);
                // Add 10 loyalty points
                await (0, loyaltyService_1.addLoyaltyPoints)(fullReservation.userId, 10, `Réservation confirmée par l'admin : ${fullReservation.bus.trip.departure} -> ${fullReservation.bus.trip.destination}`);
            }
        }
        else {
            reservation = await prisma_1.default.reservation.update({
                where: { id },
                data: { status }
            });
        }
        res.json({ success: true, reservation });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReservationStatus = updateReservationStatus;
const markTicketAsUsed = async (req, res, next) => {
    try {
        const ticketCode = req.params.ticketCode;
        if (req.user.role !== 'ADMIN' && req.user.role !== 'AGENT' && req.user.role !== 'CONTROLLER') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const ticket = await prisma_1.default.ticket.findUnique({
            where: { ticketCode },
            include: { reservation: { include: { bus: { include: { trip: true } } } } }
        });
        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Billet non trouvé' });
        }
        if (ticket.isUsed) {
            return res.status(400).json({ success: false, error: 'Billet déjà utilisé' });
        }
        if (ticket.reservation.status === 'CANCELLED') {
            return res.status(400).json({ success: false, error: 'La réservation est annulée' });
        }
        const updatedTicket = await prisma_1.default.ticket.update({
            where: { ticketCode },
            data: {
                isUsed: true,
                usedAt: new Date()
            }
        });
        res.json({ success: true, message: 'Billet validé avec succès', ticket: updatedTicket });
    }
    catch (error) {
        next(error);
    }
};
exports.markTicketAsUsed = markTicketAsUsed;
const uploadProof = async (req, res, next) => {
    try {
        const { paymentProofUrl } = req.body;
        const id = req.params.id;
        const reservation = await prisma_1.default.reservation.findUnique({ where: { id } });
        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
        }
        if (reservation.userId !== req.user.userId) {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const updated = await prisma_1.default.reservation.update({
            where: { id },
            data: { paymentProofUrl }
        });
        res.json({ success: true, reservation: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadProof = uploadProof;
const deleteReservation = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, error: 'Accès non autorisé' });
        }
        const reservation = await prisma_1.default.reservation.findUnique({
            where: { id }
        });
        if (!reservation) {
            return res.status(404).json({ success: false, error: 'Réservation non trouvée' });
        }
        await prisma_1.default.$transaction(async (tx) => {
            // Delete associated ticket if it exists
            await tx.ticket.deleteMany({
                where: { reservationId: id }
            });
            // Delete associated payment if it exists
            await tx.payment.deleteMany({
                where: { reservationId: id }
            });
            // Delete the reservation itself
            await tx.reservation.delete({
                where: { id }
            });
        });
        res.json({ success: true, message: 'Réservation supprimée définitivement' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReservation = deleteReservation;
