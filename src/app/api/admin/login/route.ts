import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signAdminToken, sessionCookieOptions, COOKIE_NAME } from "@/lib/adminAuth";

// ── Admin credentials loaded from server-side env var only ──────────────────
// Format: JSON array — [{"id":"a1","name":"Rishi","pin":"1234"}, ...]
// Set ADMIN_CREDENTIALS in .env.local (local) and Vercel Environment Variables.
// NEVER prefix this with NEXT_PUBLIC_
interface AdminMember {
  id: string;
  name: string;
  pin: string;
}

function getAdminCredentials(): AdminMember[] {
  const raw = process.env.ADMIN_CREDENTIALS;
  if (!raw) {
    console.error("[admin/login] ADMIN_CREDENTIALS env var is not set.");
    return [];
  }
  try {
    return JSON.parse(raw) as AdminMember[];
  } catch {
    console.error("[admin/login] ADMIN_CREDENTIALS is not valid JSON.");
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { memberId, pin } = await req.json();

    const members = getAdminCredentials();
    const member = members.find((m) => m.id === memberId && m.pin === pin);

    if (!member) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    // Issue a signed JWT — NOT a plain JSON blob
    const token = await signAdminToken({
      adminId: member.id,
      adminName: member.name,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ ok: true, name: member.name });
    response.cookies.set(COOKIE_NAME, token, sessionCookieOptions(isProduction));

    return response;
  } catch (err) {
    console.error("[POST /api/admin/login]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
