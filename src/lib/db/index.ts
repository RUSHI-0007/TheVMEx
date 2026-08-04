import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqlClient: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  // Use connection_limit=1 for serverless — prevents exhausting the pool
  sqlClient = postgres(connectionString, {
    max: 1,
    ssl: "require",
    idle_timeout: 20,
    connect_timeout: 10,
  });

  dbInstance = drizzle(sqlClient, { schema });
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
