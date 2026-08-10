import { Pool } from "pg";
const connectionString = "postgresql://postgres.ifrismvjfuoaqjyfhgdh:Rushik%241600%23@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
pool.query("SELECT 1")
  .then(() => { console.log("Connected on 5432!"); process.exit(0); })
  .catch((e) => { console.error("Error on 5432:", e); process.exit(1); });
