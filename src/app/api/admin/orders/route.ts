import { NextRequest, NextResponse } from "next/server";
import { getPendingOrders } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    // Verify admin session cookie
    const cookieStore = await cookies();
    const session = cookieStore.get("vmex_admin_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const orders = await getPendingOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
