import { Request, Response } from 'express';
import Activity from '../models/Activity';

// Get recent activities (last 50)
export const getRecentActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error });
  }
};