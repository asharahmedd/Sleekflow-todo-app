import axios from 'axios';
import type { Todo, CreateTodoInput, UpdateTodoInput, SharedUser } from '../types/Todo';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const todoApi = {
  async getAllTodos(): Promise<Todo[]> {
    const response = await api.get<Todo[]>('/todos');
    return response.data;
  },

  async getTodoById(id: string): Promise<Todo> {
    const response = await api.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  async createTodo(todo: CreateTodoInput): Promise<Todo> {
    const response = await api.post<Todo>('/todos', todo);
    return response.data;
  },

  async updateTodo(id: string, todo: UpdateTodoInput): Promise<Todo> {
    const response = await api.put<Todo>(`/todos/${id}`, todo);
    return response.data;
  },

  async deleteTodo(id: string): Promise<void> {
    await api.delete(`/todos/${id}`);
  },

  // Sharing methods
  async shareWithUser(todoId: string, userEmail: string): Promise<Todo> {
    const response = await api.post<Todo>(`/todos/${todoId}/share`, { userEmail });
    return response.data;
  },

  async unshareWithUser(todoId: string, userId: string): Promise<Todo> {
    const response = await api.delete<Todo>(`/todos/${todoId}/share/${userId}`);
    return response.data;
  },

  async getSharedUsers(todoId: string): Promise<{ creator: SharedUser; sharedWith: SharedUser[] }> {
    const response = await api.get<{ creator: SharedUser; sharedWith: SharedUser[] }>(`/todos/${todoId}/shared-users`);
    return response.data;
  },
};