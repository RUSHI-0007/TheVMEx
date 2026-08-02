import { NextRequest, NextResponse } from "next/server";
import { lookupOrder } from "@/lib/orders";
import { generateQrDataUrl, buildTicketQrPayload } from "@/lib/qr";
import { getTicketTier } from "@/lib/utils";
import type { TicketTierId } from "@/lib/config";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query?.trim()) {
    return NextResponse.json({ error: "Search query required" }, { status: 400 });
  }

  try {
    const orders = await lookupOrder(query);
    if (orders.length === 0) {
      return NextResponse.json({ error: "No orders found" }, { status: 404 });
    }

    const results = await Promise.all(
      orders.map(async (order) => {
        const tier = getTicketTier(order.ticketTierId as TicketTierId);
        let ticketQr: string | null = null;

        if (order.status === "approved" && order.ticketId) {
          const payload = buildTicketQrPayload(
            order.ticketId,
            order.orderId,
            order.attendeeName
          );
          ticketQr = await generateQrDataUrl(payload);
        }

        return {
          ...order,
          tierName: tier?.label ?? order.ticketTierId,
          ticketQr,
        };
      })
    );

    return NextResponse.json({ orders: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to lookup order" },
      { status: 500 }
    );
  }
}
