import express from 'express';
import { createReview, getLatestReviews } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, createReview);
router.get('/', getLatestReviews);

export default router;
