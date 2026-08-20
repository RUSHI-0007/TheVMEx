import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { guestList } from "@/lib/db/schema";
import { ilike } from "drizzle-orm";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const db = getDb();

    // ilike gives us case-insensitive partial match; fetch up to 50 so the
    // JS prefix-sort below can find the best 30 even when the DB returns
    // contains-matches before starts-with matches.
    const rows = await db
      .select()
      .from(guestList)
      .where(ilike(guestList.name, `%${q}%`))
      .limit(50);

    // ── Sort: exact → starts-with → contains ─────────────────────────────────
    const qLow = q.toLowerCase();
    const ranked = rows
      .map((r) => {
        const n = r.name.toLowerCase();
        const rank = n === qLow ? 0 : n.startsWith(qLow) ? 1 : 2;
        return { ...r, _rank: rank };
      })
      .sort((a, b) => a._rank - b._rank)
      .slice(0, 30);

    // ── Cross-source duplicate detection ─────────────────────────────────────
    // If the same normalised name appears under more than one source in the
    // result set, flag every matching row so the UI can show a warning.
    const nameSourceCount = new Map<string, Set<string>>();
    for (const r of ranked) {
      const sources = nameSourceCount.get(r.nameKey) ?? new Set();
      sources.add(r.sourceKey);
      nameSourceCount.set(r.nameKey, sources);
    }

    const results = ranked.map(({ _rank, ...r }) => ({
      ...r,
      // dupeSourceNames: the *other* sources this person also appears under
      dupeSourceNames: (() => {
        const allSources = nameSourceCount.get(r.nameKey)!;
        if (allSources.size <= 1) return [];
        // Return the display-form source names for rows *other* than this one
        return ranked
          .filter((x) => x.nameKey === r.nameKey && x.sourceKey !== r.sourceKey)
          .map((x) => x.source);
      })(),
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Guest list search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
