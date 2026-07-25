import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/adminAuth";
import { rejectOrder } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = await verifyAdminSession(cookieStore);
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const reason = (body.reason as string)?.trim();

    if (!reason) {
      return NextResponse.json({ error: "reason_required" }, { status: 400 });
    }

    const result = await rejectOrder(id, session.adminId, session.adminName, reason);

    if (!result.ok) {
      if (result.error === "already_handled") {
        return NextResponse.json({ error: "already_handled" }, { status: 409 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/orders/[id]/reject]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
