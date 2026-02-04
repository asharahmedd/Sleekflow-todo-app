import axios from 'axios';
import type { Comment, CreateCommentInput, UpdateCommentInput } from '../types/Comment';

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

export const commentApi = {
  // Get all comments for a todo
  async getComments(todoId: string): Promise<Comment[]> {
    const response = await api.get<Comment[]>(`/todos/${todoId}/comments`);
    return response.data;
  },

  // Create a new comment
  async createComment(todoId: string, input: CreateCommentInput): Promise<Comment> {
    const response = await api.post<Comment>(`/todos/${todoId}/comments`, input);
    return response.data;
  },

  // Update a comment
  async updateComment(commentId: string, input: UpdateCommentInput): Promise<Comment> {
    const response = await api.put<Comment>(`/comments/${commentId}`, input);
    return response.data;
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },

  // Get comment count for a todo
  async getCommentCount(todoId: string): Promise<number> {
    const response = await api.get<{ count: number }>(`/todos/${todoId}/comments/count`);
    return response.data.count;
  },
};
