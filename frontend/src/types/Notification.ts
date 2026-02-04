export interface NotificationPreferences {
  _id: string;
  userId: string;
  emailOnTodoShared: boolean;
  emailOnComment: boolean;
  emailOnDueSoon: boolean;
  emailOnOverdue: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  reminderHours: 24 | 48 | 72;
  digestTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesInput {
  emailOnTodoShared?: boolean;
  emailOnComment?: boolean;
  emailOnDueSoon?: boolean;
  emailOnOverdue?: boolean;
  dailyDigest?: boolean;
  weeklyDigest?: boolean;
  reminderHours?: 24 | 48 | 72;
  digestTime?: string;
}
