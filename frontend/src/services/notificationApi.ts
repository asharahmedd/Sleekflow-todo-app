import axios from 'axios';
import type { NotificationPreferences, UpdatePreferencesInput } from '../types/Notification';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const notificationApi = {
  // Get user's notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  async updatePreferences(input: UpdatePreferencesInput): Promise<NotificationPreferences> {
    const response = await api.put<NotificationPreferences>('/notifications/preferences', input);
    return response.data;
  },

  // Send test email
  async sendTestEmail(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/notifications/test');
    return response.data;
  },
};
