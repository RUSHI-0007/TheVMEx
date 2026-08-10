import { getDb } from "./src/lib/db/index";
import { orders, orderAuditLog } from "./src/lib/db/schema";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function clearData() {
  try {
    const db = getDb();
    
    // Delete data from child tables first to avoid foreign key constraints (if any)
    await db.delete(orderAuditLog);
    console.log("Cleared all records from order_audit_log.");
    
    // Delete data from parent table
    await db.delete(orders);
    console.log("Cleared all dummy bookings from orders.");
    
    console.log("Successfully cleared all data without modifying the database schema!");
  } catch (error) {
    console.error("Error clearing data:", error);
  } finally {
    process.exit(0);
  }
}

clearData();
