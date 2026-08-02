import { NextResponse } from "next/server";
import { fetchCashfreeOrder } from "@/lib/cashfree";
import { getOrderByOrderId, approveOrder } from "@/lib/orders";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.redirect(new URL("/?error=missing_order", request.url));
  }

  try {
    const order = await getOrderByOrderId(orderId);
    if (!order) {
      return NextResponse.redirect(new URL("/?error=not_found", request.url));
    }

    if (order.status === "approved") {
      // Already processed via webhook
      return NextResponse.redirect(new URL(`/ticket?orderId=${orderId}`, request.url));
    }

    // Verify status directly with Cashfree securely
    const cfOrder = await fetchCashfreeOrder(orderId);
    
    if (cfOrder.order_status === "PAID") {
      await approveOrder(orderId, "system", "Cashfree Gateway");
      return NextResponse.redirect(new URL(`/ticket?orderId=${orderId}`, request.url));
    } else {
      // Not paid (failed or user abandoned)
      return NextResponse.redirect(new URL(`/#tickets`, request.url));
    }
  } catch (error) {
    console.error("Cashfree return error:", error);
    return NextResponse.redirect(new URL(`/#tickets`, request.url));
  }
}
