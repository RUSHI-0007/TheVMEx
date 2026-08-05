import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqlPool: Pool | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  // Force Session pooler (5432) instead of Transaction pooler (6543)
  // because Transaction pooler does not support prepared statements with pg driver
  if (connectionString.includes(":6543/")) {
    connectionString = connectionString.replace(":6543/", ":5432/");
  }

  // Strip sslmode=require from connection string because pg overrides rejectUnauthorized: false
  if (connectionString.includes("?sslmode=require")) {
    connectionString = connectionString.replace("?sslmode=require", "");
  }

  // Use connection_limit=1 for serverless — prevents exhausting the pool
  if (!sqlPool) {
    sqlPool = new Pool({
      connectionString,
      max: 1,
      ssl: {
        rejectUnauthorized: false,
      },
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 10000,
    });
  }

  dbInstance = drizzle(sqlPool, { schema });
  return dbInstance;
}

// Keep uploads dir for legacy screenshot support
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
