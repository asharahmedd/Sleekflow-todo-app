import axios from 'axios';
import type { Activity } from '../types/Activity';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const activityApi = {
  async getRecentActivities(): Promise<Activity[]> {
    const response = await api.get<Activity[]>('/activities');
    return response.data;
  },
};