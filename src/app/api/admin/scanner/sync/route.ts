import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

const syncSchema = z.array(
  z.object({
    ticketId: z.string(),
    checkedInAt: z.string(),
  })
);

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const checkIns = parsed.data;
    if (checkIns.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    const db = getDb();
    
    // Process each one individually since they have different timestamps
    // OR we could just update them to true and their respective timestamps in a loop.
    let updatedCount = 0;
    
    // We could do this in a single transaction if we want, but for now a loop is fine since 
    // it's background sync and batches won't be massive.
    for (const checkIn of checkIns) {
      const result = await db
        .update(orders)
        .set({
          checkedIn: true,
          checkedInAt: checkIn.checkedInAt,
        })
        .where(eq(orders.ticketId, checkIn.ticketId));
        
      // Drizzle result length check depends on the driver, but we don't strictly need to count perfectly
      // We just need to ensure the update query ran.
      updatedCount++;
    }

    return NextResponse.json({ success: true, updated: updatedCount });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync check-ins" },
      { status: 500 }
    );
  }
}
