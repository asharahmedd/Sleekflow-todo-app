import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  emailOnTodoShared: boolean;
  emailOnComment: boolean;
  emailOnDueSoon: boolean;
  emailOnOverdue: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  reminderHours: number; // Hours before due date to send reminder (24, 48, or 72)
  digestTime: string; // Time for daily digest (e.g., "08:00")
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    emailOnTodoShared: {
      type: Boolean,
      default: true,
    },
    emailOnComment: {
      type: Boolean,
      default: true,
    },
    emailOnDueSoon: {
      type: Boolean,
      default: true,
    },
    emailOnOverdue: {
      type: Boolean,
      default: true,
    },
    dailyDigest: {
      type: Boolean,
      default: false,
    },
    weeklyDigest: {
      type: Boolean,
      default: false,
    },
    reminderHours: {
      type: Number,
      enum: [24, 48, 72],
      default: 24,
    },
    digestTime: {
      type: String,
      default: '08:00',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotificationPreferences>(
  'NotificationPreferences',
  NotificationPreferencesSchema
);
