import { Router } from 'express';
import { createReservation, initiatePayment, payReservation, getMyReservations, getAllReservations, getTicketByCode, updateReservationStatus, markTicketAsUsed, uploadProof } from '../controllers/reservationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all reservation routes
router.use(authenticateToken);

router.get('/me', getMyReservations);
router.get('/all', getAllReservations);
router.get('/ticket/:ticketCode', getTicketByCode);
router.put('/ticket/:ticketCode/use', markTicketAsUsed);
router.post('/', createReservation);
router.post('/initiate-payment', initiatePayment);
router.post('/pay', payReservation);
router.patch('/:id/status', updateReservationStatus);
router.patch('/:id/proof', uploadProof);

export default router;
