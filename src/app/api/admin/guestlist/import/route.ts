import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { guestList } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Normalise a string for deduplication — same transform as DB nameKey / sourceKey. */
function norm(s: string) {
  return s.trim().toLowerCase();
}

// ─── Validation (server-side, runs before any DB work) ───────────────────────
const guestSchema = z.object({
  name:   z.string().min(1).transform((s) => s.trim()),
  phone:  z.string().default("").transform((s) => s.trim()),
  source: z.string().min(1).transform((s) => s.trim()),
});

const importSchema = z.object({
  guests: z.array(guestSchema).min(1),
});

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = importSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data format", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { guests } = parsed.data;
  const db = getDb();
  const now = new Date().toISOString();

  // Fetch all existing rows, keyed by normalised name+source pair
  const existingRows = await db.select().from(guestList);
  const existingMap = new Map<string, typeof existingRows[number]>();
  for (const row of existingRows) {
    existingMap.set(`${row.nameKey}||${row.sourceKey}`, row);
  }

  let newCount       = 0;
  let updatedCount   = 0;
  let unchangedCount = 0;

  for (const g of guests) {
    const nameKey   = norm(g.name);
    const sourceKey = norm(g.source);
    const mapKey    = `${nameKey}||${sourceKey}`;
    const existing  = existingMap.get(mapKey);

    if (!existing) {
      // New guest. onConflictDoNothing is a safety net for any race condition;
      // normally the pre-check above handles everything.
      await db.insert(guestList).values({
        id:          uuidv4(),
        name:        g.name,
        nameKey,
        phone:       g.phone,
        source:      g.source,
        sourceKey,
        checkedIn:   false,
        checkedInAt: null,
        uploadedAt:  now,
      }).onConflictDoNothing();
      newCount++;
    } else {
      // Existing guest — update display fields only if they changed.
      // checkedIn / checkedInAt are intentionally never touched here.
      const phoneChanged  = existing.phone  !== g.phone;
      const sourceChanged = existing.source !== g.source; // display casing may differ
      if (phoneChanged || sourceChanged) {
        await db
          .update(guestList)
          .set({ phone: g.phone, source: g.source, uploadedAt: now })
          .where(eq(guestList.id, existing.id));
        updatedCount++;
      } else {
        unchangedCount++;
      }
    }
  }

  return NextResponse.json({ newCount, updatedCount, unchangedCount });
}
