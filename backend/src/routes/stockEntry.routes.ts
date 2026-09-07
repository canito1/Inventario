import express from 'express';
import {
    getStockEntries,
    getStockEntry,
    createStockEntry,
    updateStockEntry,
    deleteStockEntry
} from '../controllers/stockEntry.controller';
import { authenticate } from '../middleware/auth';
import { validateStockEntry, validateUpdateStockEntry } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/stock-entries - Get all stock entries with pagination and filters
router.get('/', getStockEntries);

// GET /api/stock-entries/:id - Get single stock entry
router.get('/:id', getStockEntry);

// POST /api/stock-entries - Create new stock entry
router.post('/', validateStockEntry, createStockEntry);

// PUT /api/stock-entries/:id - Update stock entry
router.put('/:id', validateUpdateStockEntry, updateStockEntry);

// DELETE /api/stock-entries/:id - Delete stock entry
router.delete('/:id', deleteStockEntry);

export default router;