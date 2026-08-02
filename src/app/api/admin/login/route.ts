import { NextRequest, NextResponse } from "next/server";
import {
  authenticateAdmin,
  createAdminSession,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, pin } = await request.json();
    if (!name || !pin) {
      return NextResponse.json(
        { error: "Name and PIN required" },
        { status: 400 }
      );
    }

    const admin = authenticateAdmin(name, pin);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = createAdminSession(admin.id, admin.name);
    const response = NextResponse.json({
      admin: { id: admin.id, name: admin.name },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
