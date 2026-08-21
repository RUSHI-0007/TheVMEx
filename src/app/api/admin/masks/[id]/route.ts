import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { maskOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ─── PATCH /api/admin/masks/[id] ──────────────────────────────────────────────
// Person 2 marks a mask order as paid.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(req as unknown as Request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.action !== "mark_paid") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const db = getDb();
  const [updated] = await db
    .update(maskOrders)
    .set({
      status: "paid",
      paidAt: new Date(),
    })
    .where(eq(maskOrders.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json(updated);
}
