import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken as express.RequestHandler);

router.get('/', getNotifications as express.RequestHandler);
router.put('/mark-all-read', markAllAsRead as express.RequestHandler);
router.put('/:id/read', markAsRead as express.RequestHandler);

export default router;
