import { create } from 'zustand';
import { format } from 'date-fns';
import api from '../lib/api';

// ──────────────────────────────
// Types aligned with backend schema
// ──────────────────────────────
export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description?: string | null;
  emoji: string;
  color: string;
  category: string;
  frequency: string;
  point_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: number;
  user_id: number;
  habit_id: number;
  log_date: string;
  completed: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreakData {
  habit: Habit;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface CreateHabitForm {
  name: string;
  description?: string;
  category: string;
  frequency: string;
  point_value: number;
  color: string;
  emoji: string;
}

interface HabitState {
  habits: Habit[];
  todayLogs: DailyLog[];
  streaks: StreakData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  addHabit: (form: CreateHabitForm) => Promise<void>;
  updateHabit: (id: number, updates: Partial<CreateHabitForm & { is_active: boolean }>) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;

  // Logs
  fetchTodayLogs: () => Promise<void>;
  fetchAllLogs: () => Promise<void>;
  toggleLog: (habitId: number, date?: string) => Promise<{ levelUp: boolean; newLevel: number; newPoints: number } | null>;
  addNote: (logId: number, note: string) => Promise<void>;

  // Streaks
  fetchStreaks: () => Promise<void>;

  // Getters (computed from local state)
  getActiveHabits: () => Habit[];
  getTodayCompletionRate: () => number;
  getHabitStreak: (habitId: number) => { currentStreak: number; longestStreak: number };

  // Seed data for demo
  seedSampleHabits: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayLogs: [],
  streaks: [],
  isLoading: false,
  error: null,

  // ─── Habits ─────────────────────────────────────────────────
  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/habits');
      set({ habits: res.data.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to fetch habits', isLoading: false });
    }
  },

  addHabit: async (form: CreateHabitForm) => {
    try {
      const res = await api.post('/habits', form);
      set((state) => ({ habits: [...state.habits, res.data.data] }));
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to create habit' });
    }
  },

  updateHabit: async (id: number, updates) => {
    try {
      const res = await api.put(`/habits/${id}`, updates);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? res.data.data : h)),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to update habit' });
    }
  },

  deleteHabit: async (id: number) => {
    try {
      await api.delete(`/habits/${id}`);
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? { ...h, is_active: false } : h)),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to delete habit' });
    }
  },

  // ─── Logs ────────────────────────────────────────────────────
  fetchTodayLogs: async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const res = await api.get(`/logs/date/${today}`);
      set({ todayLogs: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to fetch logs' });
    }
  },

  fetchAllLogs: async () => {
    try {
      const res = await api.get('/logs/all');
      set({ todayLogs: res.data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to fetch logs' });
    }
  },

  toggleLog: async (habitId: number, date?: string) => {
    const logDate = date || format(new Date(), 'yyyy-MM-dd');
    try {
      const res = await api.post('/logs/toggle', { habit_id: habitId, log_date: logDate });
      const { log, points, streak } = res.data.data;

      // Update local today logs
      set((state) => {
        const existingIdx = state.todayLogs.findIndex(
          (l) => l.habit_id === habitId && l.log_date === logDate
        );
        if (existingIdx >= 0) {
          const updated = [...state.todayLogs];
          updated[existingIdx] = log;
          return { todayLogs: updated };
        }
        return { todayLogs: [...state.todayLogs, log] };
      });

      // Update streak in local state
      if (streak) {
        set((state) => ({
          streaks: state.streaks.map((s) =>
            s.habit.id === habitId
              ? { ...s, currentStreak: streak.current, longestStreak: streak.longest }
              : s
          ),
        }));
      }

      return points;
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to toggle log' });
      return null;
    }
  },

  addNote: async (logId: number, note: string) => {
    try {
      const res = await api.put(`/logs/${logId}/note`, { notes: note });
      set((state) => ({
        todayLogs: state.todayLogs.map((l) => (l.id === logId ? res.data.data : l)),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.error ?? 'Failed to add note' });
    }
  },

  // ─── Streaks ─────────────────────────────────────────────────
  fetchStreaks: async () => {
    try {
      const res = await api.get('/stats/streaks');
      set({ streaks: res.data.data });
    } catch {
      // Non-critical
    }
  },

  // ─── Computed getters ────────────────────────────────────────
  getActiveHabits: () => get().habits.filter((h) => h.is_active),

  getTodayCompletionRate: () => {
    const activeHabits = get().getActiveHabits();
    if (activeHabits.length === 0) return 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const completedToday = get().todayLogs.filter(
      (l) => l.log_date === today && l.completed
    ).length;
    return Math.round((completedToday / activeHabits.length) * 100);
  },

  getHabitStreak: (habitId: number) => {
    const streak = get().streaks.find((s) => s.habit.id === habitId);
    return {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
    };
  },

  // ─── Seed data ───────────────────────────────────────────────
  seedSampleHabits: async () => {
    const samples: CreateHabitForm[] = [
      { name: 'Drink Water', category: 'health', frequency: 'daily', point_value: 10, color: '#06b6d4', emoji: '💧', description: 'Drink 8 glasses of water' },
      { name: 'Exercise', category: 'fitness', frequency: 'daily', point_value: 25, color: '#ef4444', emoji: '🏃', description: '30 minutes of exercise' },
      { name: 'Read', category: 'learning', frequency: 'daily', point_value: 15, color: '#8b5cf6', emoji: '📚', description: 'Read for 20 minutes' },
      { name: 'Meditate', category: 'mindfulness', frequency: 'daily', point_value: 20, color: '#14b8a6', emoji: '🧘', description: '10 minutes of meditation' },
    ];
    for (const habit of samples) {
      await get().addHabit(habit);
    }
  },
}));
