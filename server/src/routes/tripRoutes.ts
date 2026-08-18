import { Router } from 'express';
import { getTrips, getTripById, createTrip, updateTrip, deleteTrip } from '../controllers/tripController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Routes
router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', authenticateToken, requireRole(['ADMIN']), createTrip);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateTrip);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteTrip);

export default router;
