import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// ──────────────────────────────
// USERS
// ──────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  level: integer('level').default(1).notNull(),
  total_points: integer('total_points').default(0).notNull(),
  longest_streak: integer('longest_streak').default(0).notNull(),
  rank: text('rank').default('Beginner').notNull(),
  bio: text('bio'),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// ──────────────────────────────
// HABITS
// ──────────────────────────────
export const habits = sqliteTable(
  'habits',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    emoji: text('emoji').default('✅').notNull(),
    color: text('color').default('#3B82F6').notNull(),
    category: text('category').default('health').notNull(),
    frequency: text('frequency').default('daily').notNull(),
    point_value: integer('point_value').default(10).notNull(),
    is_active: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [index('idx_habits_user_id').on(table.user_id)]
);

// ──────────────────────────────
// DAILY LOGS
// ──────────────────────────────
export const daily_logs = sqliteTable(
  'daily_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    habit_id: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    log_date: text('log_date').notNull(), // YYYY-MM-DD
    completed: integer('completed', { mode: 'boolean' }).default(false).notNull(),
    notes: text('notes'),
    created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    index('idx_daily_logs_user_habit_date').on(table.user_id, table.habit_id, table.log_date),
  ]
);

// ──────────────────────────────
// STREAKS
// ──────────────────────────────
export const streaks = sqliteTable(
  'streaks',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    habit_id: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' })
      .unique(),
    current_streak: integer('current_streak').default(0).notNull(),
    longest_streak: integer('longest_streak').default(0).notNull(),
    last_completed_date: text('last_completed_date'),
    updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [index('idx_streaks_habit_id').on(table.habit_id)]
);

// ──────────────────────────────
// ACHIEVEMENTS
// ──────────────────────────────
export const achievements = sqliteTable(
  'achievements',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').default('🏆').notNull(),
    points_earned: integer('points_earned').default(0).notNull(),
    earned_at: text('earned_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    index('idx_achievements_user_id').on(table.user_id),
    index('idx_achievements_user_key').on(table.user_id, table.key),
  ]
);

// ──────────────────────────────
// RELATIONS
// ──────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  logs: many(daily_logs),
  achievements: many(achievements),
  streaks: many(streaks),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.user_id], references: [users.id] }),
  logs: many(daily_logs),
  streak: many(streaks),
}));

export const dailyLogsRelations = relations(daily_logs, ({ one }) => ({
  user: one(users, { fields: [daily_logs.user_id], references: [users.id] }),
  habit: one(habits, { fields: [daily_logs.habit_id], references: [habits.id] }),
}));

// ──────────────────────────────
// INFERRED TYPES
// ──────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type DailyLog = typeof daily_logs.$inferSelect;
export type NewDailyLog = typeof daily_logs.$inferInsert;
export type Streak = typeof streaks.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
