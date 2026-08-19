import express from 'express';
import { createReview, getLatestReviews, getAdminReviews, publishReview, deleteReview } from '../controllers/reviewController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', getLatestReviews);

// Routes clients
router.post('/', authenticateToken, createReview);

// Routes admin
router.get('/admin', authenticateToken, requireRole(['ADMIN']), getAdminReviews);
router.patch('/:id/publish', authenticateToken, requireRole(['ADMIN']), publishReview);
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteReview);

export default router;
