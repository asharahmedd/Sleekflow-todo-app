import express from 'express';
import { getRecentActivities } from '../controllers/activityController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get recent activities (protected)
router.get('/', protect, getRecentActivities);

export default router;