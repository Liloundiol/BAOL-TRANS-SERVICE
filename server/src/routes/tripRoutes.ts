import { Router } from 'express';
import { getTrips, getTripById, createTrip, updateTrip, deleteTrip, toggleTripStatus } from '../controllers/tripController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware';

const router = Router();

// Routes
// Cache trips for 10 seconds (short cache since availability changes fast)
router.get('/', cacheMiddleware(10), getTrips);
router.get('/:id', getTripById);
router.post('/', authenticateToken, requireRole(['ADMIN']), (req, res, next) => { clearCache('/trips'); next(); }, createTrip);
router.put('/:id', authenticateToken, requireRole(['ADMIN']), (req, res, next) => { clearCache('/trips'); next(); }, updateTrip);
router.patch('/:id/toggle-status', authenticateToken, requireRole(['ADMIN']), (req, res, next) => { clearCache('/trips'); next(); }, toggleTripStatus);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), (req, res, next) => { clearCache('/trips'); next(); }, deleteTrip);

export default router;
