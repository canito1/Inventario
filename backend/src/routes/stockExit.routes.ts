import express from 'express';
import {
    getStockExits,
    getStockExit,
    createStockExit,
    updateStockExit,
    deleteStockExit
} from '../controllers/stockExit.controller';
import { authenticate } from '../middleware/auth';
import { validateStockExit, validateUpdateStockExit } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/stock-exits - Get all stock exits with pagination and filters
router.get('/', getStockExits);

// GET /api/stock-exits/:id - Get single stock exit
router.get('/:id', getStockExit);

// POST /api/stock-exits - Create new stock exit
router.post('/', validateStockExit, createStockExit);

// PUT /api/stock-exits/:id - Update stock exit
router.put('/:id', validateUpdateStockExit, updateStockExit);

// DELETE /api/stock-exits/:id - Delete stock exit
router.delete('/:id', deleteStockExit);

export default router;