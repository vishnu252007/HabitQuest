import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { env } from './env';
import { logger } from './logger';
import * as schema from '../db/schema';
import { runMigrations } from '../db/runner';

let _db: LibSQLDatabase<typeof schema> | null = null;

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return _db;
}

export async function initializeDatabase(): Promise<void> {
  logger.info('🗄️  Initializing database...');

  let dbUrl = env.DATABASE_URL;

  // On Vercel, if DATABASE_URL is a local file, force it to /tmp to make it writeable
  if (process.env.VERCEL === '1') {
    if (!dbUrl.startsWith('libsql:') && !dbUrl.startsWith('http:') && !dbUrl.startsWith('https:')) {
      logger.info('Running on Vercel serverless. Redirecting local SQLite database to /tmp/habit-tracker.db');
      dbUrl = 'file:/tmp/habit-tracker.db';
    }
  }

  const url =
    dbUrl.startsWith('file:') ||
    dbUrl.startsWith('libsql:') ||
    dbUrl.startsWith('http:') ||
    dbUrl.startsWith('https:')
      ? dbUrl
      : `file:${dbUrl}`;

  const client: Client = createClient({ url });

  // Run migrations
  await runMigrations(client);

  _db = drizzle(client, { schema });

  logger.info(`✅ Database ready at: ${dbUrl}`);
}

// Proxy so db.select() works naturally across all services
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
