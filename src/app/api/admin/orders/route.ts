import { NextResponse } from "next/server";
import { getPendingOrders } from "@/lib/orders";
import { getSessionFromRequest } from "@/lib/auth";
import { getTicketTier } from "@/lib/utils";
import type { TicketTierId } from "@/lib/config";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getPendingOrders();
    const enriched = orders.map((order) => {
      const tier = getTicketTier(order.ticketTierId as TicketTierId);
      return {
        ...order,
        tierName: tier?.label ?? order.ticketTierId,
      };
    });

    return NextResponse.json({
      orders: enriched,
      admin: { id: session.adminId, name: session.adminName },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
