import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    // Strip internal fields before sending to client
    const { paise_suffix: _p, ...safe } = order;
    void _p;
    return NextResponse.json({ order: safe });
  } catch (err) {
    console.error("[GET /api/orders/[id]]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
