import { Router } from 'express';
import { createReservation, initiatePayment, payReservation, getMyReservations, getAllReservations, getTicketByCode, updateReservationStatus, markTicketAsUsed, uploadProof } from '../controllers/reservationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect all reservation routes
router.use(authenticateToken);

router.get('/me', getMyReservations);
router.get('/all', requireRole(['ADMIN', 'AGENT']), getAllReservations);
router.get('/ticket/:ticketCode', getTicketByCode);
router.put('/ticket/:ticketCode/use', requireRole(['ADMIN', 'AGENT', 'CONTROLLER']), markTicketAsUsed);
router.post('/', createReservation);
router.post('/initiate-payment', initiatePayment);
router.post('/pay', payReservation);
router.patch('/:id/status', requireRole(['ADMIN', 'AGENT']), updateReservationStatus);
router.patch('/:id/proof', uploadProof);

export default router;
