import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../services/AuthApi';
import type { User, LoginCredentials, RegisterCredentials } from '../types/Auth';
import { socketService } from '../services/socketService';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  // Initialize from localStorage
  const initialize = () => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  };

  // Register
  const register = async (credentials: RegisterCredentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.register(credentials);
      token.value = response.token;
      user.value = {
        _id: response._id,
        name: response.name,
        email: response.email,
      };
      
      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user.value));
      
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Login
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(credentials);
      token.value = response.token;
      user.value = {
        _id: response._id,
        name: response.name,
        email: response.email,
      };
      
      // Save to localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user.value));
      
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Logout
  const logout = () => {
    // Broadcast logout activity before disconnecting
    if (user.value) {
      socketService.disconnect();
    }
    authApi.logout();
    user.value = null;
    token.value = null;
    error.value = null;
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initialize,
    register,
    login,
    logout,
  };
});