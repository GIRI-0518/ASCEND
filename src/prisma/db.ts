import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// Fallback to database connection string if not provided in environment during build
const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_tY20GakDKEJO@ep-lingering-bird-axvdnjh5-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const dbUrl = process.env['DATABASE_URL'] || DEFAULT_DATABASE_URL;

// Singleton for Next.js hot-reload compatibility
const globalForDb = globalThis as unknown as { db: ReturnType<typeof postgres<Contract>> | undefined };

export const db =
  globalForDb.db ??
  postgres<Contract>({
    contractJson,
    url: dbUrl,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
