import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/adminAuth";
import { checkInOrder } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = await verifyAdminSession(cookieStore);
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await checkInOrder(id, session.adminId, session.adminName);

    if (!result.ok) {
      if (result.error === "already_checked_in") {
        return NextResponse.json(
          { error: "already_checked_in", checkedInAt: result.checkedInAt },
          { status: 409 }
        );
      }
      if (result.error === "not_found") {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      if (result.error === "not_approved") {
        return NextResponse.json({ error: "not_approved" }, { status: 403 });
      }
      if (result.error === "refunded") {
        return NextResponse.json({ error: "refunded" }, { status: 403 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, order: result.order });
  } catch (err) {
    console.error("[POST /api/admin/orders/[id]/checkin]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
