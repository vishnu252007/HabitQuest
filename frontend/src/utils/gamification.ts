import {
  format,
  subDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  parseISO,
  differenceInDays,
} from 'date-fns';
import type { Habit, DailyLog } from '../types';
import { RANK_THRESHOLDS } from '../types';

// ===== LEVEL & POINTS =====

export function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / 1000) + 1;
}

export function pointsToNextLevel(totalPoints: number): number {
  return 1000 - (totalPoints % 1000);
}

export function levelProgress(totalPoints: number): number {
  return ((totalPoints % 1000) / 1000) * 100;
}

export function getRank(totalPoints: number): { rank: string; emoji: string } {
  let current = RANK_THRESHOLDS[0];
  for (const threshold of RANK_THRESHOLDS) {
    if (totalPoints >= threshold.min) {
      current = threshold;
    }
  }
  return { rank: current.rank, emoji: current.emoji };
}

// ===== STREAK CALCULATION =====

export function calculateStreak(
  habitId: string,
  logs: DailyLog[]
): { currentStreak: number; longestStreak: number } {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId && l.completed)
    .map((l) => l.logDate)
    .sort()
    .reverse();

  if (habitLogs.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if the most recent log is today or yesterday
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  
  if (habitLogs[0] !== today && habitLogs[0] !== yesterday) {
    // Streak is broken
    currentStreak = 0;
  } else {
    currentStreak = 1;
    for (let i = 1; i < habitLogs.length; i++) {
      const diff = differenceInDays(
        parseISO(habitLogs[i - 1]),
        parseISO(habitLogs[i])
      );
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  longestStreak = 1;
  const sortedAsc = [...habitLogs].sort();
  for (let i = 1; i < sortedAsc.length; i++) {
    const diff = differenceInDays(parseISO(sortedAsc[i]), parseISO(sortedAsc[i - 1]));
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

// ===== ACHIEVEMENT DETECTION =====

export function detectNewAchievements(
  habits: Habit[],
  logs: DailyLog[],
  streaks: { habitId: string; currentStreak: number; longestStreak: number }[],
  totalPoints: number,
  existingAchievementTypes: string[]
): string[] {
  const newAchievements: string[] = [];
  const has = (type: string) => existingAchievementTypes.includes(type);

  // First completion
  if (!has('first_completion') && logs.some((l) => l.completed)) {
    newAchievements.push('first_completion');
  }

  // Streak achievements
  const maxCurrentStreak = Math.max(0, ...streaks.map((s) => s.currentStreak));
  const maxLongestStreak = Math.max(0, ...streaks.map((s) => s.longestStreak));
  const maxStreak = Math.max(maxCurrentStreak, maxLongestStreak);

  if (!has('streak_7') && maxStreak >= 7) newAchievements.push('streak_7');
  if (!has('streak_30') && maxStreak >= 30) newAchievements.push('streak_30');
  if (!has('streak_100') && maxStreak >= 100) newAchievements.push('streak_100');

  // Habit count achievements
  const activeHabits = habits.filter((h) => h.isActive).length;
  if (!has('habits_5') && activeHabits >= 5) newAchievements.push('habits_5');
  if (!has('habits_10') && activeHabits >= 10) newAchievements.push('habits_10');

  // Points achievements
  if (!has('points_1000') && totalPoints >= 1000) newAchievements.push('points_1000');
  if (!has('points_5000') && totalPoints >= 5000) newAchievements.push('points_5000');
  if (!has('points_10000') && totalPoints >= 10000) newAchievements.push('points_10000');

  // Perfect week
  if (!has('perfect_week')) {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
      .filter((d) => d <= new Date())
      .map((d) => format(d, 'yyyy-MM-dd'));

    if (weekDays.length === 7) {
      const allCompleted = weekDays.every((day) => {
        const dayLogs = logs.filter((l) => l.logDate === day);
        return habits.every((h) =>
          dayLogs.some((l) => l.habitId === h.id && l.completed)
        );
      });
      if (allCompleted && habits.length > 0) {
        newAchievements.push('perfect_week');
      }
    }
  }

  return newAchievements;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '🏆';
  if (streak >= 30) return '💪';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '⚡';
  if (streak >= 1) return '✨';
  return '';
}

export function formatPoints(points: number): string {
  if (points >= 10000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
}
