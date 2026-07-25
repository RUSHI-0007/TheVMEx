import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TEAM_MEMBERS } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { memberId, pin } = await req.json();

    const member = ADMIN_TEAM_MEMBERS.find(
      (m) => m.id === memberId && m.pin === pin
    );

    if (!member) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const sessionPayload = JSON.stringify({
      adminId: member.id,
      adminName: member.name,
    });

    const response = NextResponse.json({ ok: true, name: member.name });
    response.cookies.set("vmex_admin_session", sessionPayload, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 hours
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[POST /api/admin/login]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("vmex_admin_session");
  return response;
}
