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

  const url =
    env.DATABASE_URL.startsWith('file:') ||
    env.DATABASE_URL.startsWith('libsql:') ||
    env.DATABASE_URL.startsWith('http:') ||
    env.DATABASE_URL.startsWith('https:')
      ? env.DATABASE_URL
      : `file:${env.DATABASE_URL}`;

  const client: Client = createClient({ url });

  // Run migrations
  await runMigrations(client);

  _db = drizzle(client, { schema });

  logger.info(`✅ Database ready at: ${env.DATABASE_URL}`);
}

// Proxy so db.select() works naturally across all services
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
