import { Router } from 'express';
import { getTrips, getTripById, createTrip, updateTrip, deleteTrip } from '../controllers/tripController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Routes
router.get('/', getTrips);
router.get('/:id', getTripById);
router.post('/', authenticateToken, createTrip);
router.put('/:id', authenticateToken, updateTrip);
router.delete('/:id', authenticateToken, deleteTrip);

export default router;
