import mongoose, { Document, Schema } from 'mongoose';

export type ActivityType = 
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'todo_created'
  | 'todo_updated'
  | 'todo_status_changed'
  | 'todo_priority_changed'
  | 'todo_completed'
  | 'todo_deleted'
  | 'todo_shared'
  | 'todo_unshared'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_deleted';

export interface IActivity extends Document {
  type: ActivityType;
  userId: mongoose.Types.ObjectId;
  userName: string;
  todoId?: mongoose.Types.ObjectId;
  todoName?: string;
  oldStatus?: string;
  newStatus?: string;
  oldPriority?: string;
  newPriority?: string;
  message: string;
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>({
  type: {
    type: String,
    enum: [
      'user_registered',
      'user_logged_in',
      'user_logged_out',
      'todo_created',
      'todo_updated',
      'todo_status_changed',
      'todo_priority_changed',
      'todo_completed',
      'todo_deleted',
      'todo_shared',
      'todo_unshared',
      'comment_added',
      'comment_updated',
      'comment_deleted'
    ],
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  todoId: {
    type: Schema.Types.ObjectId,
    ref: 'Todo',
  },
  todoName: {
    type: String,
  },
  oldStatus: String,
  newStatus: String,
  oldPriority: String,
  newPriority: String,
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Index for faster queries
ActivitySchema.index({ timestamp: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);