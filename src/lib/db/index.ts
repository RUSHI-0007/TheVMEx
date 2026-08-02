import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL
  ? "/tmp/masquerade-data"
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "masquerade.db");

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function runMigrations(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL UNIQUE,
      ticket_tier_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      base_amount REAL NOT NULL,
      payable_amount REAL NOT NULL,
      attendee_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      college TEXT NOT NULL,
      year TEXT NOT NULL,
      utr TEXT UNIQUE,
      screenshot_path TEXT,
      cashfree_order_id TEXT,
      payment_mode TEXT NOT NULL DEFAULT 'upi_manual',
      status TEXT NOT NULL DEFAULT 'draft',
      expires_at TEXT,
      ticket_id TEXT,
      handled_by TEXT,
      handled_by_name TEXT,
      handled_at TEXT,
      rejection_reason TEXT,
      claimed_by TEXT,
      claimed_by_name TEXT,
      claimed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
    CREATE INDEX IF NOT EXISTS orders_payable_amount_idx ON orders(payable_amount);
    CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders(phone);
    CREATE INDEX IF NOT EXISTS orders_email_idx ON orders(email);

    CREATE TABLE IF NOT EXISTS order_audit_log (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      action TEXT NOT NULL,
      admin_id TEXT,
      admin_name TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Live-migration: add columns to existing DBs that predate this schema
  const existingCols = sqlite
    .prepare("PRAGMA table_info(orders)")
    .all() as { name: string }[];
  const colNames = existingCols.map((c) => c.name);

  if (!colNames.includes("cashfree_order_id")) {
    sqlite.exec("ALTER TABLE orders ADD COLUMN cashfree_order_id TEXT");
  }
  if (!colNames.includes("payment_mode")) {
    sqlite.exec(
      "ALTER TABLE orders ADD COLUMN payment_mode TEXT NOT NULL DEFAULT 'upi_manual'"
    );
  }
}

export function getDb() {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const uploadsDir = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  runMigrations(sqlite);
  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export function getUploadsDir() {
  const uploadsDir = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}
