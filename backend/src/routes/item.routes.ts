import { Router } from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  updateStock,
  getLowStockItems,
  getItemStats
} from '../controllers/item.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET routes
router.get('/', getItems);
router.get('/stats', getItemStats);
router.get('/low-stock', getLowStockItems);
router.get('/:id', getItem);

// POST routes (manager and admin only)
router.post('/', authorize('admin', 'manager'), validate(schemas.createItem), createItem);

// PUT routes
router.put('/:id', authorize('admin', 'manager'), validate(schemas.updateItem), updateItem);
router.put('/:id/stock', authorize('admin', 'manager'), updateStock);

// DELETE routes (admin only)
router.delete('/:id', authorize('admin'), deleteItem);

export default router;