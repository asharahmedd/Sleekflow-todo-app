import { Request, Response } from 'express';
import NotificationPreferences from '../models/NotificationPreferences';

// @desc    Get user's notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    let preferences = await NotificationPreferences.findOne({ userId: req.user?.id });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await NotificationPreferences.create({
        userId: req.user?.id,
      });
    }

    res.status(200).json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching preferences', error });
  }
};

// @desc    Update user's notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      emailOnTodoShared,
      emailOnComment,
      emailOnDueSoon,
      emailOnOverdue,
      dailyDigest,
      weeklyDigest,
      reminderHours,
      digestTime,
    } = req.body;

    let preferences = await NotificationPreferences.findOne({ userId: req.user?.id });

    if (!preferences) {
      // Create if doesn't exist
      preferences = await NotificationPreferences.create({
        userId: req.user?.id,
        emailOnTodoShared,
        emailOnComment,
        emailOnDueSoon,
        emailOnOverdue,
        dailyDigest,
        weeklyDigest,
        reminderHours,
        digestTime,
      });
    } else {
      // Update existing
      if (emailOnTodoShared !== undefined) preferences.emailOnTodoShared = emailOnTodoShared;
      if (emailOnComment !== undefined) preferences.emailOnComment = emailOnComment;
      if (emailOnDueSoon !== undefined) preferences.emailOnDueSoon = emailOnDueSoon;
      if (emailOnOverdue !== undefined) preferences.emailOnOverdue = emailOnOverdue;
      if (dailyDigest !== undefined) preferences.dailyDigest = dailyDigest;
      if (weeklyDigest !== undefined) preferences.weeklyDigest = weeklyDigest;
      if (reminderHours !== undefined) preferences.reminderHours = reminderHours;
      if (digestTime !== undefined) preferences.digestTime = digestTime;

      await preferences.save();
    }

    res.status(200).json(preferences);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences', error });
  }
};

// @desc    Send test email
// @route   POST /api/notifications/test
// @access  Private
export const sendTestEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sendEmail } = await import('../services/emailService');
    const User = (await import('../models/User')).default;
    
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const testEmailHtml = `
      <h2>✅ Test Email Successful!</h2>
      <p>Hi ${user.name},</p>
      <p>Your email notifications are working correctly!</p>
      <p>This is a test email to verify your notification settings.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: '✅ Test Email from SleekFlow Todo',
      html: testEmailHtml,
    });

    res.status(200).json({ message: 'Test email sent successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending test email', error: error.message });
  }
};
