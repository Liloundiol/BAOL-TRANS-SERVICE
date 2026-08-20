import express from 'express';
import { getPackages, createPackage, updatePackageStatus, deletePackage, payPackage } from '../controllers/packageController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole(['ADMIN', 'AGENT', 'STUDENT']), getPackages);
router.post('/', requireRole(['ADMIN', 'AGENT', 'STUDENT']), createPackage);
router.post('/pay', requireRole(['STUDENT']), payPackage);
router.patch('/:id/status', requireRole(['ADMIN', 'AGENT']), updatePackageStatus);
router.delete('/:id', requireRole(['ADMIN']), deletePackage);

export default router;
