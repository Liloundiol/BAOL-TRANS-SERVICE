import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Only ADMIN can manage users
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
