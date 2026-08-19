import express from 'express';
import { createReview, getLatestReviews } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, createReview);
router.get('/', getLatestReviews);

export default router;
