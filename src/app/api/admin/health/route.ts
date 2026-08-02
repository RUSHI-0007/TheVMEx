import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { sql, count } from "drizzle-orm";

/**
 * GET /api/admin/health
 * Returns DB connectivity status and order counts.
 */
export async function GET() {
  try {
    const db = getDb();
    const result = await db
      .select({
        total: count(),
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status = 'pending_verification' THEN 1 ELSE 0 END)`,
        rejected: sql<number>`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`,
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN status = 'approved' THEN payable_amount ELSE 0 END), 0)`,
      })
      .from(orders);

    return NextResponse.json({
      ok: true,
      dbPath: process.env.VERCEL ? "/tmp/masquerade-data/masquerade.db" : "data/masquerade.db",
      environment: process.env.VERCEL ? "vercel" : "local",
      stats: result[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "DB error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
