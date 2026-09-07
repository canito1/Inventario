import { Router } from 'express';
import {
  getDashboardStats,
  getInventoryOverview
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/inventory-overview', getInventoryOverview);

export default router;