import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, resetAdmins } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware';

const router = express.Router();

router.get('/reset-admins', resetAdmins);

// Only ADMIN can manage users
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.route('/')
  .get(cacheMiddleware(60), getUsers)
  .post((req, res, next) => { clearCache('/users'); next(); }, createUser);

router.route('/:id')
  .put((req, res, next) => { clearCache('/users'); next(); }, updateUser)
  .delete((req, res, next) => { clearCache('/users'); next(); }, deleteUser);

export default router;
