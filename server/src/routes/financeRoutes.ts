import express from 'express';
import { getFinanceStats, getRecentPayments } from '../controllers/financeController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Only ADMIN can access finance data
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/stats', getFinanceStats);
router.get('/payments', getRecentPayments);

export default router;
