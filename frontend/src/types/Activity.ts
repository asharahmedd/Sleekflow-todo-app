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

export interface Activity {
  _id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  todoId?: string;
  todoName?: string;
  oldStatus?: string;
  newStatus?: string;
  oldPriority?: string;
  newPriority?: string;
  message: string;
  timestamp: string;
}