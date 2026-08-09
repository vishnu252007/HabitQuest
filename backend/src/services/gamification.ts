import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/database';
import { users, habits, daily_logs, streaks, achievements } from '../db/schema';
import { logger } from '../config/logger';

// ──────────────────────────────
// ACHIEVEMENT DEFINITIONS
// ──────────────────────────────
const ACHIEVEMENT_DEFS = [
  {
    key: 'first_completion',
    title: 'Getting Started',
    description: 'Complete your first habit',
    icon: '🌱',
    points: 10,
    check: (ctx: AchievementContext) => ctx.totalCompletions >= 1,
  },
  {
    key: 'streak_7',
    title: '7 Day Streak',
    description: 'Maintain a 7-day streak on any habit',
    icon: '🔥',
    points: 50,
    check: (ctx: AchievementContext) => ctx.maxStreak >= 7,
  },
  {
    key: 'streak_30',
    title: '30 Day Streak',
    description: 'Maintain a 30-day streak on any habit',
    icon: '💪',
    points: 200,
    check: (ctx: AchievementContext) => ctx.maxStreak >= 30,
  },
  {
    key: 'streak_100',
    title: '100 Day Streak',
    description: 'Maintain a 100-day streak on any habit',
    icon: '🏆',
    points: 500,
    check: (ctx: AchievementContext) => ctx.maxStreak >= 100,
  },
  {
    key: 'habits_5',
    title: 'Habit Builder',
    description: 'Create 5 different habits',
    icon: '📋',
    points: 25,
    check: (ctx: AchievementContext) => ctx.activeHabits >= 5,
  },
  {
    key: 'habits_10',
    title: 'Habit Master',
    description: 'Create 10 different habits',
    icon: '🎯',
    points: 75,
    check: (ctx: AchievementContext) => ctx.activeHabits >= 10,
  },
  {
    key: 'points_1000',
    title: 'Rising Star',
    description: 'Earn 1,000 total points',
    icon: '⭐',
    points: 50,
    check: (ctx: AchievementContext) => ctx.totalPoints >= 1000,
  },
  {
    key: 'points_5000',
    title: 'Superstar',
    description: 'Earn 5,000 total points',
    icon: '🌟',
    points: 100,
    check: (ctx: AchievementContext) => ctx.totalPoints >= 5000,
  },
  {
    key: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all habits every day for 7 days',
    icon: '💎',
    points: 100,
    check: (ctx: AchievementContext) => ctx.hasPerfectWeek,
  },
] as const;

interface AchievementContext {
  totalCompletions: number;
  maxStreak: number;
  activeHabits: number;
  totalPoints: number;
  hasPerfectWeek: boolean;
}

// ──────────────────────────────
// RANK SYSTEM
// ──────────────────────────────
const RANKS = [
  { min: 0, rank: 'Beginner' },
  { min: 1000, rank: 'Apprentice' },
  { min: 3000, rank: 'Practitioner' },
  { min: 5000, rank: 'Warrior' },
  { min: 10000, rank: 'Master' },
  { min: 25000, rank: 'Grandmaster' },
  { min: 50000, rank: 'Legend' },
];

function calculateLevel(points: number): number {
  return Math.floor(points / 1000) + 1;
}

function calculateRank(points: number): string {
  const rank = [...RANKS].reverse().find((r) => points >= r.min);
  return rank?.rank ?? 'Beginner';
}

// ──────────────────────────────
// STREAK CALCULATION
// ──────────────────────────────
async function calculateHabitStreak(
  habitId: number
): Promise<{ current: number; longest: number }> {
  const logs = await db
    .select({ log_date: daily_logs.log_date, completed: daily_logs.completed })
    .from(daily_logs)
    .where(and(eq(daily_logs.habit_id, habitId), eq(daily_logs.completed, true)))
    .orderBy(desc(daily_logs.log_date));

  if (!logs.length) return { current: 0, longest: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = 0;
  let longest = 0;
  let temp = 0;
  let expectedDate = new Date(today);

  // Calculate current streak from today backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = expectedDate.toISOString().split('T')[0];
    const hasLog = logs.some((l) => l.log_date === dateStr);
    if (hasLog) {
      current++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (i === 0) {
      // Allow today to not be logged yet (check yesterday)
      expectedDate.setDate(expectedDate.getDate() - 1);
      const yesterdayStr = expectedDate.toISOString().split('T')[0];
      if (!logs.some((l) => l.log_date === yesterdayStr)) break;
    } else {
      break;
    }
  }

  // Calculate longest streak from all logs
  const sortedDates = logs
    .map((l) => l.log_date)
    .sort()
    .reverse();

  let prevDate: Date | null = null;
  for (const dateStr of sortedDates) {
    const d = new Date(dateStr);
    if (!prevDate) {
      temp = 1;
    } else {
      const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
    prevDate = d;
  }
  longest = Math.max(longest, temp);

  return { current, longest };
}

// ──────────────────────────────
// GAMIFICATION SERVICE
// ──────────────────────────────
export const GamificationService = {
  calculateLevel,
  calculateRank,

  /**
   * Award points to a user, recalculate level + rank, update DB
   */
  async awardPoints(
    userId: number,
    points: number
  ): Promise<{ levelUp: boolean; newLevel: number; newPoints: number }> {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) throw new Error('User not found');

    const oldLevel = calculateLevel(user.total_points);
    const newPoints = Math.max(0, user.total_points + points);
    const newLevel = calculateLevel(newPoints);
    const newRank = calculateRank(newPoints);

    await db
      .update(users)
      .set({ total_points: newPoints, level: newLevel, rank: newRank, updated_at: new Date().toISOString() })
      .where(eq(users.id, userId));

    return { levelUp: newLevel > oldLevel, newLevel, newPoints };
  },

  /**
   * Recalculate and upsert streak for a habit
   */
  async updateStreak(userId: number, habitId: number): Promise<{ current: number; longest: number }> {
    const { current, longest } = await calculateHabitStreak(habitId);

    const existing = await db
      .select()
      .from(streaks)
      .where(eq(streaks.habit_id, habitId))
      .get();

    const newLongest = Math.max(longest, existing?.longest_streak ?? 0);

    if (existing) {
      await db
        .update(streaks)
        .set({
          current_streak: current,
          longest_streak: newLongest,
          last_completed_date: current > 0 ? new Date().toISOString().split('T')[0] : null,
          updated_at: new Date().toISOString(),
        })
        .where(eq(streaks.habit_id, habitId));
    } else {
      await db.insert(streaks).values({
        user_id: userId,
        habit_id: habitId,
        current_streak: current,
        longest_streak: newLongest,
        last_completed_date: current > 0 ? new Date().toISOString().split('T')[0] : null,
      });
    }

    // Update user's longest_streak if needed
    const user = await db.select({ longest_streak: users.longest_streak }).from(users).where(eq(users.id, userId)).get();
    if (user && newLongest > user.longest_streak) {
      await db.update(users).set({ longest_streak: newLongest }).where(eq(users.id, userId));
    }

    return { current, longest: newLongest };
  },

  /**
   * Check all achievement conditions and award any newly earned ones
   */
  async checkAndAwardAchievements(userId: number): Promise<void> {
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) return;

    const userHabits = await db.select().from(habits).where(eq(habits.user_id, userId));
    const activeHabits = userHabits.filter((h) => h.is_active).length;

    const userLogs = await db
      .select({ completed: daily_logs.completed })
      .from(daily_logs)
      .where(and(eq(daily_logs.user_id, userId), eq(daily_logs.completed, true)));
    const totalCompletions = userLogs.length;

    const userStreaks = await db.select().from(streaks).where(eq(streaks.user_id, userId));
    const maxStreak = Math.max(0, ...userStreaks.map((s) => s.current_streak));

    // Perfect week: all habits completed every day for last 7 days
    let hasPerfectWeek = false;
    if (activeHabits > 0) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDayStr = sevenDaysAgo.toISOString().split('T')[0];

      const recentLogs = await db
        .select()
        .from(daily_logs)
        .where(
          and(eq(daily_logs.user_id, userId), eq(daily_logs.completed, true))
        );

      const filtered = recentLogs.filter((l) => l.log_date >= sevenDayStr);
      const uniqueDays = new Set(filtered.map((l) => l.log_date)).size;
      hasPerfectWeek = uniqueDays >= 7;
    }

    const ctx: AchievementContext = {
      totalCompletions,
      maxStreak,
      activeHabits,
      totalPoints: user.total_points,
      hasPerfectWeek,
    };

    // Get existing achievement keys for this user
    const existing = await db
      .select({ key: achievements.key })
      .from(achievements)
      .where(eq(achievements.user_id, userId));
    const existingKeys = new Set(existing.map((a) => a.key));

    for (const def of ACHIEVEMENT_DEFS) {
      if (!existingKeys.has(def.key) && def.check(ctx)) {
        await db.insert(achievements).values({
          user_id: userId,
          key: def.key,
          title: def.title,
          description: def.description,
          icon: def.icon,
          points_earned: def.points,
        });

        // Award bonus points (don't re-check achievements to avoid recursion)
        await this.awardPoints(userId, def.points);
        logger.info(`Achievement unlocked: ${def.title} for user ${userId}`);
      }
    }
  },
};
