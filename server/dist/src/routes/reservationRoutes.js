"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservationController_1 = require("../controllers/reservationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all reservation routes
router.use(authMiddleware_1.authenticateToken);
router.get('/me', reservationController_1.getMyReservations);
router.get('/all', reservationController_1.getAllReservations);
router.get('/ticket/:ticketCode', reservationController_1.getTicketByCode);
router.put('/ticket/:ticketCode/use', reservationController_1.markTicketAsUsed);
router.post('/', reservationController_1.createReservation);
router.post('/initiate-payment', reservationController_1.initiatePayment);
router.post('/pay', reservationController_1.payReservation);
router.patch('/:id/status', reservationController_1.updateReservationStatus);
router.patch('/:id/proof', reservationController_1.uploadProof);
exports.default = router;
