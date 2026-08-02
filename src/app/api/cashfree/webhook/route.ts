import { NextResponse } from "next/server";
import { verifyCashfreeWebhook } from "@/lib/cashfree";
import { getOrderByOrderId, approveOrder } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-webhook-signature");
    const timestamp = request.headers.get("x-webhook-timestamp");
    const rawBody = await request.text();

    if (!signature || !timestamp || !rawBody) {
      return NextResponse.json({ error: "Missing webhook headers or body" }, { status: 400 });
    }

    const isValid = verifyCashfreeWebhook(signature, rawBody, timestamp);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    // Cashfree payload for successful payment contains data.order.order_id
    if (data.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data.data?.order?.order_id;
      
      if (orderId) {
        const order = await getOrderByOrderId(orderId);
        
        // Approve if it's currently pending
        if (order && order.status !== "approved") {
          await approveOrder(orderId, "system", "Cashfree Webhook");
        }
      }
    }

    // Always return 200 OK to acknowledge receipt of the webhook to Cashfree
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
