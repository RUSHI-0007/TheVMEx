import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getPendingOrders } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await verifyAdminSession(cookieStore);
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
