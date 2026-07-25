import { NextRequest, NextResponse } from "next/server";
import { approveOrder } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("vmex_admin_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { adminId, adminName } = JSON.parse(session);

    const result = await approveOrder(id, adminId, adminName);

    if (!result.ok) {
      if (result.error === "already_handled") {
        return NextResponse.json({ error: "already_handled" }, { status: 409 });
      }
      if (result.error === "race_condition") {
        return NextResponse.json({ error: "race_condition" }, { status: 409 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/orders/[id]/approve]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
