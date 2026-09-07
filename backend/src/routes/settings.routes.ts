import { Router } from 'express';
import {
  getSettings,
  updateSettings
} from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateUpdateSettings } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET route - accessible to all authenticated users
router.get('/', getSettings);

// PUT route - admin only with validation
router.put('/', authorize('admin'), validateUpdateSettings, updateSettings);

export default router;
