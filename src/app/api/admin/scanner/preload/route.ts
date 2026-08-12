import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getTicketTier } from "@/lib/utils";
import type { TicketTierId } from "@/lib/config";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const approvedOrders = await db
      .select({
        ticketId: orders.ticketId,
        orderId: orders.orderId,
        attendeeName: orders.attendeeName,
        ticketTierId: orders.ticketTierId,
        quantity: orders.quantity,
        college: orders.college,
        phone: orders.phone,
        checkedIn: orders.checkedIn,
        checkedInAt: orders.checkedInAt,
        guests: orders.guests,
      })
      .from(orders)
      .where(
        // we only care about approved orders that have a ticketId generated
        eq(orders.status, "approved")
      );

    const results = approvedOrders
      .filter((o) => o.ticketId !== null)
      .map((order) => {
        const tier = getTicketTier(order.ticketTierId as TicketTierId);
        return {
          ...order,
          tierName: tier?.label ?? order.ticketTierId,
        };
      });

    return NextResponse.json({ tickets: results }, { status: 200 });
  } catch (error) {
    console.error("Preload error:", error);
    return NextResponse.json({ error: "Failed to preload tickets" }, { status: 500 });
  }
}
