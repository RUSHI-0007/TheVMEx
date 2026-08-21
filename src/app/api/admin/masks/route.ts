import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { maskOrders } from "@/lib/db/schema";
import { MASK_PRICE_RUPEES } from "@/lib/config";
import { desc, eq } from "drizzle-orm";

// ─── GET /api/admin/masks ──────────────────────────────────────────────────────
// Returns all mask_orders for Person 2's initial page load.
// Pending first (oldest at top = first served), then paid (newest first).
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req as unknown as Request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = await db
    .select()
    .from(maskOrders)
    .orderBy(desc(maskOrders.createdAt));

  // Split into pending (oldest first) + paid (newest first)
  const pending = rows.filter((r) => r.status === "pending").reverse();
  const paid    = rows.filter((r) => r.status === "paid");

  return NextResponse.json({ pending, paid, maskPrice: MASK_PRICE_RUPEES });
}

// ─── POST /api/admin/masks ─────────────────────────────────────────────────────
// Person 1 sends a mask order from the entry station.
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req as unknown as Request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { guestName?: string; source?: string; maskCount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { guestName, source, maskCount } = body;

  if (!guestName?.trim()) return NextResponse.json({ error: "guestName required" }, { status: 400 });
  if (!source?.trim())    return NextResponse.json({ error: "source required" },    { status: 400 });
  if (typeof maskCount !== "number" || maskCount < 1 || maskCount > 10) {
    return NextResponse.json({ error: "maskCount must be 1–10" }, { status: 400 });
  }

  const amountDue = maskCount * MASK_PRICE_RUPEES;

  const db = getDb();
  const [row] = await db
    .insert(maskOrders)
    .values({
      guestName: guestName.trim(),
      source:    source.trim(),
      maskCount,
      amountDue,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
