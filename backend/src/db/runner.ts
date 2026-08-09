import { Client } from '@libsql/client';
import { logger } from '../config/logger';

export async function runMigrations(client: Client): Promise<void> {
  logger.info('Running migrations...');

  // Execute each statement separately for libsql compatibility
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      total_points INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      rank TEXT NOT NULL DEFAULT 'Beginner',
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      emoji TEXT NOT NULL DEFAULT '✅',
      color TEXT NOT NULL DEFAULT '#3B82F6',
      category TEXT NOT NULL DEFAULT 'health',
      frequency TEXT NOT NULL DEFAULT 'daily',
      point_value INTEGER NOT NULL DEFAULT 10,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      log_date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      habit_id INTEGER NOT NULL UNIQUE REFERENCES habits(id) ON DELETE CASCADE,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '🏆',
      points_earned INTEGER NOT NULL DEFAULT 0,
      earned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_daily_logs_user_habit_date ON daily_logs(user_id, habit_id, log_date)`,
    `CREATE INDEX IF NOT EXISTS idx_streaks_habit_id ON streaks(habit_id)`,
    `CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_achievements_user_key ON achievements(user_id, key)`,
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }

  logger.info('✅ Migrations complete');
}
