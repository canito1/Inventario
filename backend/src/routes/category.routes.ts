import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', getCategories);
router.get('/stats', getCategoryStats);
router.get('/:id', getCategory);

// POST routes (manager and admin only)
router.post('/', authorize('admin', 'manager'), validate(schemas.createCategory), createCategory);

// PUT routes (manager and admin only)
router.put('/:id', authorize('admin', 'manager'), validate(schemas.updateCategory), updateCategory);

// DELETE routes (admin only)
router.delete('/:id', authorize('admin'), deleteCategory);

export default router;