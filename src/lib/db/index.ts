import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import path from "path";
import fs from "fs";
import * as schema from './schema';
import dotenv from "dotenv";

// Load environment variables (mostly needed for local dev scripts)
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in the environment variables.');
  }

  const sql = neon(connectionString);
  dbInstance = drizzle(sql, { schema });
  return dbInstance;
}

// Keep the uploads directory logic for legacy screenshot support
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? "/tmp/masquerade-data"
  : path.join(process.cwd(), "data");

export function getUploadsDir() {
  const uploadsDir = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}
