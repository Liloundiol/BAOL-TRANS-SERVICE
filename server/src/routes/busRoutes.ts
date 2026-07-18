import { Router } from 'express';
import { getAllBuses, createBus, updateBus, deleteBus } from '../controllers/busController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Toutes les routes de bus nécessitent une authentification
router.use(authenticateToken);

router.get('/all', getAllBuses);
router.post('/', createBus);
router.put('/:id', updateBus);
router.delete('/:id', deleteBus);

export default router;
