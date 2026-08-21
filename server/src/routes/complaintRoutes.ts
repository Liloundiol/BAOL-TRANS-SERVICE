import express from 'express';
import { createComplaint, getComplaints, updateComplaintStatus } from '../controllers/complaintController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.post('/', requireRole(['ADMIN', 'AGENT', 'STUDENT']), createComplaint);
router.get('/', requireRole(['ADMIN', 'AGENT']), getComplaints);
router.patch('/:id/status', requireRole(['ADMIN', 'AGENT']), updateComplaintStatus);

export default router;
