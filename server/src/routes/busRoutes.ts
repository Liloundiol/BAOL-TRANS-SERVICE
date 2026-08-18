import { Router } from 'express';
import { getAllBuses, createBus, updateBus, deleteBus } from '../controllers/busController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Toutes les routes de bus nécessitent une authentification
router.use(authenticateToken);

router.get('/all', requireRole(['ADMIN', 'AGENT']), getAllBuses);
router.post('/', requireRole(['ADMIN']), createBus);
router.put('/:id', requireRole(['ADMIN']), updateBus);
router.delete('/:id', requireRole(['ADMIN']), deleteBus);

export default router;
