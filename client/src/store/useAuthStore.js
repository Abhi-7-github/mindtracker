import { create } from 'zustand';
import * as authService from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.me();
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data) {
        if (res.token) {
          localStorage.setItem('polo_token', res.token);
          localStorage.setItem('token', res.token);
        }
        set({ user: res.data, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.message || 'Login failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(userData);
      if (res.success && res.data) {
        if (res.token) {
          localStorage.setItem('polo_token', res.token);
          localStorage.setItem('token', res.token);
        }
        set({ user: res.data, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
    } catch (err) {
      const msg = err.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('polo_token');
      localStorage.removeItem('token');
      await authService.logout();
    } catch (e) {
      // Ignore
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },


  updateProfile: async (payload) => {
    set({ isLoading: true });
    try {
      const res = await authService.updateProfile(payload);
      if (res.success && res.data) {
        set({ user: res.data, isLoading: false });
        return { success: true };
      }
    } catch (err) {
      set({ isLoading: false });
      return { success: false, message: err.message || 'Update failed' };
    }
  },
}));
