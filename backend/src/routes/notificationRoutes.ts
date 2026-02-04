import express from 'express';
import {
  getPreferences,
  updatePreferences,
  sendTestEmail,
} from '../controllers/notificationController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/test', sendTestEmail);

export default router;
