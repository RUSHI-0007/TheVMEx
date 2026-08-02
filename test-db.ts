import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

const sqlite = new Database("data/masquerade.db");
const db = drizzle(sqlite, { schema });

async function run() {
  const result = await db.update(schema.orders).set({ status: "approved" }).where(eq(schema.orders.id, "nonexistent"));
  console.log("Result:", result);
}
run().catch(console.error);
