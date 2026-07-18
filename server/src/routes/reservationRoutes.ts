import { Router } from 'express';
import { createReservation, payReservation, getMyReservations, getAllReservations, getTicketByCode, updateReservationStatus, markTicketAsUsed } from '../controllers/reservationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all reservation routes
router.use(authenticateToken);

router.get('/me', getMyReservations);
router.get('/all', getAllReservations);
router.get('/ticket/:ticketCode', getTicketByCode);
router.put('/ticket/:ticketCode/use', markTicketAsUsed);
router.post('/', createReservation);
router.post('/pay', payReservation);
router.patch('/:id/status', updateReservationStatus);

export default router;
