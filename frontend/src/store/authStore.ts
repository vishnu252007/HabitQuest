import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: number;
  email: string;
  username: string;
  level: number;
  total_points: number;
  longest_streak: number;
  rank: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  activeHabits?: number;
  totalAchievements?: number;
}

const getErrorMessage = (err: any, fallback: string): string => {
  const data = err.response?.data;
  if (!data) return fallback;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object' && typeof data.error.message === 'string') {
    return data.error.message;
  }
  if (typeof data.message === 'string') return data.message;
  return fallback;
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  loginWithGoogle: (email?: string, username?: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const storedToken = localStorage.getItem('habit_tracker_token');

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('habit_tracker_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err, 'Invalid email or password');
      set({ isLoading: false, error: message });
      return false;
    }
  },

  signup: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { email, username, password });
      const { user, token } = response.data.data;

      localStorage.setItem('habit_tracker_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err, 'Signup failed. Please try again.');
      set({ isLoading: false, error: message });
      return false;
    }
  },

  loginWithGoogle: async (email?: string, username?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/google', {
        email: email || 'google.user@gmail.com',
        username: username || 'Google User',
      });
      const { user, token } = response.data.data;

      localStorage.setItem('habit_tracker_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err, 'Google authentication failed');
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('habit_tracker_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const response = await api.get('/stats/user');
      set({ user: response.data.data, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

// Initialize token from localStorage
const store = useAuthStore.getState();
if (storedToken) {
  store.refreshUser();
}
