import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { guestList } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const bodySchema = z.object({ guestId: z.string().min(1) });

// Check in a guest
export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(guestList)
      .set({ checkedIn: true, checkedInAt: now })
      .where(eq(guestList.id, parsed.data.guestId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ guest: updated });
  } catch (error) {
    console.error("Guest check-in error:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

// Undo check-in
export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const db = getDb();

    const [updated] = await db
      .update(guestList)
      .set({ checkedIn: false, checkedInAt: null })
      .where(eq(guestList.id, parsed.data.guestId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json({ guest: updated });
  } catch (error) {
    console.error("Guest undo check-in error:", error);
    return NextResponse.json({ error: "Undo failed" }, { status: 500 });
  }
}
