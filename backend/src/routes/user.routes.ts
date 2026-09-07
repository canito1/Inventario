import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET routes
router.get('/', getUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUser);

// PUT routes
router.put('/:id', validate(schemas.updateUser), updateUser);
router.put('/:id/toggle-status', toggleUserStatus);

// DELETE routes
router.delete('/:id', deleteUser);

export default router;