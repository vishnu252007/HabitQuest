// ===== ENUMS =====

export type HabitCategory = 
  | 'health' 
  | 'fitness' 
  | 'mindfulness' 
  | 'learning' 
  | 'productivity' 
  | 'social' 
  | 'creativity' 
  | 'finance' 
  | 'other';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type GoalStatus = 'active' | 'completed' | 'expired';

export type AchievementType = 
  | 'first_completion' 
  | 'streak_7' 
  | 'streak_30' 
  | 'streak_100' 
  | 'habits_5'
  | 'habits_10'
  | 'points_1000'
  | 'points_5000'
  | 'points_10000'
  | 'perfect_week';

// ===== INTERFACES =====

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  level: number;
  totalPoints: number;
  rank: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  pointValue: number;
  color: string;
  emoji: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  habitId: string;
  logDate: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Streak {
  id: string;
  userId: string;
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementType: AchievementType;
  title: string;
  description: string;
  icon: string;
  pointsEarned: number;
  earnedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetDate: string;
  status: GoalStatus;
  habitIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ===== FORM TYPES =====

export interface CreateHabitForm {
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  pointValue: number;
  color: string;
  emoji: string;
}

export interface CreateGoalForm {
  title: string;
  description?: string;
  targetDate: string;
  habitIds: string[];
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

// ===== STATS TYPES =====

export interface WeeklyStat {
  day: string;
  completed: number;
  total: number;
  rate: number;
}

export interface MonthlyStat {
  week: string;
  completed: number;
  total: number;
  rate: number;
}

export interface Insights {
  bestHabit: { name: string; emoji: string; rate: number } | null;
  bestDay: { day: string; rate: number } | null;
  longestStreak: { habitName: string; emoji: string; days: number } | null;
  consistency7Day: number;
  consistency30Day: number;
  totalCompletions: number;
}

// ===== ACHIEVEMENT DEFINITIONS =====

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementType, { title: string; description: string; icon: string; points: number }> = {
  first_completion: {
    title: 'Getting Started',
    description: 'Complete your first habit',
    icon: '🌱',
    points: 10,
  },
  streak_7: {
    title: '7 Day Streak',
    description: 'Maintain a 7-day streak on any habit',
    icon: '🔥',
    points: 50,
  },
  streak_30: {
    title: '30 Day Streak',
    description: 'Maintain a 30-day streak on any habit',
    icon: '💪',
    points: 100,
  },
  streak_100: {
    title: '100 Day Streak',
    description: 'Maintain a 100-day streak on any habit',
    icon: '🏆',
    points: 500,
  },
  habits_5: {
    title: 'Habit Builder',
    description: 'Create 5 different habits',
    icon: '📋',
    points: 25,
  },
  habits_10: {
    title: 'Habit Master',
    description: 'Create 10 different habits',
    icon: '🎯',
    points: 75,
  },
  points_1000: {
    title: 'Rising Star',
    description: 'Earn 1,000 total points',
    icon: '⭐',
    points: 50,
  },
  points_5000: {
    title: 'Superstar',
    description: 'Earn 5,000 total points',
    icon: '🌟',
    points: 100,
  },
  points_10000: {
    title: 'Legend',
    description: 'Earn 10,000 total points',
    icon: '👑',
    points: 250,
  },
  perfect_week: {
    title: 'Perfect Week',
    description: 'Complete all habits for 7 days straight',
    icon: '💎',
    points: 100,
  },
};

// ===== CONSTANTS =====

export const HABIT_EMOJIS = ['💪', '📚', '🧘', '🏃', '💧', '🎨', '💻', '🎵', '🌱', '❤️', '🧠', '✍️', '🏋️', '🚶', '😴', '🍎'];

export const HABIT_COLORS = [
  '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6',
  '#10b981', '#f97316', '#ec4899', '#06b6d4', '#84cc16',
];

export const CATEGORY_LABELS: Record<HabitCategory, { label: string; emoji: string }> = {
  health: { label: 'Health', emoji: '❤️' },
  fitness: { label: 'Fitness', emoji: '💪' },
  mindfulness: { label: 'Mindfulness', emoji: '🧘' },
  learning: { label: 'Learning', emoji: '📚' },
  productivity: { label: 'Productivity', emoji: '⚡' },
  social: { label: 'Social', emoji: '👥' },
  creativity: { label: 'Creativity', emoji: '🎨' },
  finance: { label: 'Finance', emoji: '💰' },
  other: { label: 'Other', emoji: '📌' },
};

export const RANK_THRESHOLDS = [
  { min: 0, rank: 'Beginner', emoji: '🌱' },
  { min: 1000, rank: 'Apprentice', emoji: '🌿' },
  { min: 3000, rank: 'Practitioner', emoji: '🌳' },
  { min: 5000, rank: 'Warrior', emoji: '⚔️' },
  { min: 10000, rank: 'Master', emoji: '🏆' },
  { min: 25000, rank: 'Grandmaster', emoji: '👑' },
  { min: 50000, rank: 'Legend', emoji: '🌟' },
];
