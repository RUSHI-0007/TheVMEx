import { NextRequest, NextResponse } from "next/server";
import { getOrderByOrderId, getOrderAuditLog } from "@/lib/orders";
import { getSessionFromRequest } from "@/lib/auth";
import { getTicketTier } from "@/lib/utils";
import type { TicketTierId } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;

  try {
    const order = await getOrderByOrderId(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const tier = getTicketTier(order.ticketTierId as TicketTierId);
    const auditLog = await getOrderAuditLog(orderId);

    return NextResponse.json({
      order: { ...order, tierName: tier?.label ?? order.ticketTierId },
      auditLog,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
