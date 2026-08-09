import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import type { Habit, DailyLog, WeeklyStat, MonthlyStat, Insights } from '../types';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getWeeklyStats(habits: Habit[], logs: DailyLog[]): WeeklyStat[] {
  const today = new Date();
  const stats: WeeklyStat[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayName = DAY_NAMES[date.getDay()];

    const dayLogs = logs.filter((l) => l.logDate === dateStr);
    const completed = dayLogs.filter((l) => l.completed).length;
    const total = habits.filter((h) => h.isActive).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    stats.push({
      day: dayName,
      completed,
      total,
      rate,
    });
  }

  return stats;
}

export function getMonthlyStats(habits: Habit[], logs: DailyLog[]): MonthlyStat[] {
  const stats: MonthlyStat[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).filter(
      (d) => d <= new Date()
    );

    let completed = 0;
    let total = 0;

    days.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayLogs = logs.filter((l) => l.logDate === dateStr);
      completed += dayLogs.filter((l) => l.completed).length;
      total += habits.filter((h) => h.isActive).length;
    });

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const label = `Week ${4 - i}`;

    stats.push({ week: label, completed, total, rate });
  }

  return stats;
}

export function getInsights(habits: Habit[], logs: DailyLog[]): Insights {
  const activeHabits = habits.filter((h) => h.isActive);

  if (activeHabits.length === 0) {
    return {
      bestHabit: null,
      bestDay: null,
      longestStreak: null,
      consistency7Day: 0,
      consistency30Day: 0,
      totalCompletions: 0,
    };
  }

  // Best habit (highest completion rate)
  let bestHabit: Insights['bestHabit'] = null;
  let bestRate = 0;
  activeHabits.forEach((habit) => {
    const habitLogs = logs.filter((l) => l.habitId === habit.id);
    const completedCount = habitLogs.filter((l) => l.completed).length;
    const totalDays = Math.max(1, habitLogs.length);
    const rate = Math.round((completedCount / totalDays) * 100);
    if (rate > bestRate && completedCount > 0) {
      bestRate = rate;
      bestHabit = { name: habit.name, emoji: habit.emoji, rate };
    }
  });

  // Best day of the week
  const dayCompletions: Record<string, { completed: number; total: number }> = {};
  DAY_NAMES.forEach((d) => (dayCompletions[d] = { completed: 0, total: 0 }));

  logs.forEach((log) => {
    const dayName = DAY_NAMES[new Date(log.logDate).getDay()];
    dayCompletions[dayName].total++;
    if (log.completed) dayCompletions[dayName].completed++;
  });

  let bestDay: Insights['bestDay'] = null;
  let bestDayRate = 0;
  Object.entries(dayCompletions).forEach(([day, data]) => {
    const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
    if (rate > bestDayRate) {
      bestDayRate = rate;
      bestDay = { day, rate };
    }
  });

  // Consistency (7-day & 30-day)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'));
  const last30Days = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), 'yyyy-MM-dd'));

  const calc7 = last7Days.reduce(
    (acc, date) => {
      const dayLogs = logs.filter((l) => l.logDate === date);
      acc.completed += dayLogs.filter((l) => l.completed).length;
      acc.total += activeHabits.length;
      return acc;
    },
    { completed: 0, total: 0 }
  );

  const calc30 = last30Days.reduce(
    (acc, date) => {
      const dayLogs = logs.filter((l) => l.logDate === date);
      acc.completed += dayLogs.filter((l) => l.completed).length;
      acc.total += activeHabits.length;
      return acc;
    },
    { completed: 0, total: 0 }
  );

  const consistency7Day = calc7.total > 0 ? Math.round((calc7.completed / calc7.total) * 100) : 0;
  const consistency30Day = calc30.total > 0 ? Math.round((calc30.completed / calc30.total) * 100) : 0;

  // Total completions
  const totalCompletions = logs.filter((l) => l.completed).length;

  // Longest streak (across all habits, calculated from logs)
  let longestStreak: Insights['longestStreak'] = null;
  let maxStreak = 0;

  activeHabits.forEach((habit) => {
    const habitDates = logs
      .filter((l) => l.habitId === habit.id && l.completed)
      .map((l) => l.logDate)
      .sort();

    let streak = 1;
    for (let i = 1; i < habitDates.length; i++) {
      const diff = Math.abs(
        (new Date(habitDates[i]).getTime() - new Date(habitDates[i - 1]).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (Math.round(diff) === 1) {
        streak++;
      } else {
        streak = 1;
      }
      if (streak > maxStreak) {
        maxStreak = streak;
        longestStreak = { habitName: habit.name, emoji: habit.emoji, days: streak };
      }
    }
    if (habitDates.length === 1 && maxStreak === 0) {
      maxStreak = 1;
      longestStreak = { habitName: habit.name, emoji: habit.emoji, days: 1 };
    }
  });

  return {
    bestHabit,
    bestDay,
    longestStreak,
    consistency7Day,
    consistency30Day,
    totalCompletions,
  };
}

export function getTodayDateStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getTodayCompletionRate(habits: Habit[], logs: DailyLog[]): number {
  const today = getTodayDateStr();
  const activeHabits = habits.filter((h) => h.isActive);
  if (activeHabits.length === 0) return 0;

  const todayLogs = logs.filter((l) => l.logDate === today && l.completed);
  return Math.round((todayLogs.length / activeHabits.length) * 100);
}
