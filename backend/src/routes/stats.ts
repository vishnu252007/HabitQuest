import { Router, Request, Response, NextFunction } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { users, habits, daily_logs, streaks, achievements } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { GamificationService } from '../services/gamification';

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/stats/user
 * Returns the current user's profile with gamification data
 */
router.get('/user', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await db
      .select({ id: users.id, email: users.email, username: users.username, level: users.level, total_points: users.total_points, longest_streak: users.longest_streak, rank: users.rank, bio: users.bio, created_at: users.created_at })
      .from(users)
      .where(eq(users.id, req.userId))
      .get();

    const habitCount = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.user_id, req.userId), eq(habits.is_active, true)));

    const achievementCount = await db
      .select({ id: achievements.id })
      .from(achievements)
      .where(eq(achievements.user_id, req.userId));

    sendSuccess(res, {
      ...user,
      activeHabits: habitCount.length,
      totalAchievements: achievementCount.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/achievements
 * Returns all achievements earned by the user
 */
router.get('/achievements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await db
      .select()
      .from(achievements)
      .where(eq(achievements.user_id, req.userId))
      .orderBy(desc(achievements.earned_at));

    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/streaks
 * Returns streaks for all user habits
 */
router.get('/streaks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.user_id, req.userId), eq(habits.is_active, true)));

    const streakData = await db
      .select()
      .from(streaks)
      .where(eq(streaks.user_id, req.userId));

    const result = userHabits.map((h) => {
      const streak = streakData.find((s) => s.habit_id === h.id);
      return {
        habit: h,
        currentStreak: streak?.current_streak ?? 0,
        longestStreak: streak?.longest_streak ?? 0,
        lastCompletedDate: streak?.last_completed_date ?? null,
      };
    });

    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/weekly
 * Returns completion data for the last 7 days
 */
router.get('/weekly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userHabits = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.user_id, req.userId), eq(habits.is_active, true)));

    const totalHabits = userHabits.length;

    const weekData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];

      const logsForDay = await db
        .select()
        .from(daily_logs)
        .where(
          and(
            eq(daily_logs.user_id, req.userId),
            eq(daily_logs.log_date, dateStr),
            eq(daily_logs.completed, true)
          )
        );

      weekData.push({
        day: dayName,
        date: dateStr,
        completed: logsForDay.length,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((logsForDay.length / totalHabits) * 100) : 0,
      });
    }

    sendSuccess(res, weekData);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/monthly
 * Returns completion data grouped by week for the last 4 weeks
 */
router.get('/monthly', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userHabits = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.user_id, req.userId), eq(habits.is_active, true)));

    const totalHabits = userHabits.length;
    const monthData = [];

    for (let w = 3; w >= 0; w--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - w * 7);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const logs = await db
        .select()
        .from(daily_logs)
        .where(
          and(
            eq(daily_logs.user_id, req.userId),
            eq(daily_logs.completed, true)
          )
        );

      const logsInRange = logs.filter((l) => l.log_date >= startStr && l.log_date <= endStr);
      const maxPossible = totalHabits * 7;

      monthData.push({
        week: `Week ${4 - w}`,
        startDate: startStr,
        endDate: endStr,
        completed: logsInRange.length,
        total: maxPossible,
        rate: maxPossible > 0 ? Math.round((logsInRange.length / maxPossible) * 100) : 0,
      });
    }

    sendSuccess(res, monthData);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/stats/insights
 * Best habit, best day, longest streak, consistency
 */
router.get('/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.user_id, req.userId), eq(habits.is_active, true)));

    const allLogs = await db
      .select()
      .from(daily_logs)
      .where(and(eq(daily_logs.user_id, req.userId), eq(daily_logs.completed, true)));

    // Best habit (most completions)
    let bestHabit = null;
    if (userHabits.length > 0) {
      const habitCounts = userHabits.map((h) => ({
        habit: h,
        count: allLogs.filter((l) => l.habit_id === h.id).length,
      }));
      habitCounts.sort((a, b) => b.count - a.count);
      if (habitCounts[0].count > 0) {
        const best = habitCounts[0];
        bestHabit = {
          name: best.habit.name,
          emoji: best.habit.emoji,
          rate: userHabits.length > 0 ? best.count : 0,
        };
      }
    }

    // Best day of week
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    allLogs.forEach((l) => {
      const d = new Date(l.log_date).getDay();
      dayCounts[d]++;
    });
    const maxDayCount = Math.max(...dayCounts);
    const bestDayIdx = dayCounts.indexOf(maxDayCount);
    const bestDay = maxDayCount > 0 ? { day: dayNames[bestDayIdx], rate: maxDayCount } : null;

    // Longest streak across all habits
    const allStreaks = await db
      .select()
      .from(streaks)
      .where(eq(streaks.user_id, req.userId))
      .orderBy(desc(streaks.longest_streak));

    let longestStreak = null;
    if (allStreaks.length > 0 && allStreaks[0].longest_streak > 0) {
      const habit = userHabits.find((h) => h.id === allStreaks[0].habit_id);
      longestStreak = {
        habitName: habit?.name ?? 'Unknown',
        emoji: habit?.emoji ?? '✅',
        days: allStreaks[0].longest_streak,
      };
    }

    // Consistency (7 and 30 days)
    const now = new Date();
    const date7 = new Date(now);
    date7.setDate(date7.getDate() - 7);
    const date30 = new Date(now);
    date30.setDate(date30.getDate() - 30);

    const date7Str = date7.toISOString().split('T')[0];
    const date30Str = date30.toISOString().split('T')[0];

    const logs7 = allLogs.filter((l) => l.log_date >= date7Str).length;
    const logs30 = allLogs.filter((l) => l.log_date >= date30Str).length;

    const maxPossible7 = userHabits.length * 7;
    const maxPossible30 = userHabits.length * 30;

    sendSuccess(res, {
      bestHabit,
      bestDay,
      longestStreak,
      consistency7Day: maxPossible7 > 0 ? Math.round((logs7 / maxPossible7) * 100) : 0,
      consistency30Day: maxPossible30 > 0 ? Math.round((logs30 / maxPossible30) * 100) : 0,
      totalCompletions: allLogs.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
