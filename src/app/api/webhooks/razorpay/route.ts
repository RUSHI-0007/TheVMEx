import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { approveOrder, getOrderById } from "@/lib/db";
import { supabase } from "@/lib/db"; // For manual failing if needed

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is missing.");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    let isValid = false;
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSignature, "utf-8")
      );
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Process Event
    const event = JSON.parse(rawBody);
    console.log(`[Webhook] Received event: ${event.event}`);

    // We only care about payment events for now
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const internalOrderId = payment.notes?.internalOrderId;
      const razorpayPaymentId = payment.id;

      if (!internalOrderId) {
        console.error("No internalOrderId in payment notes.");
        return NextResponse.json({ ok: true }); // Acknowledge to stop retries
      }

      console.log(`[Webhook] Processing payment.captured for order ${internalOrderId}`);
      
      const order = await getOrderById(internalOrderId);
      
      if (!order) {
        console.error(`Order ${internalOrderId} not found.`);
        return NextResponse.json({ ok: true });
      }

      if (order.status === "approved") {
        console.log(`Order ${internalOrderId} is already approved. Webhook idempotent return.`);
        return NextResponse.json({ ok: true });
      }

      const approveRes = await approveOrder(
        internalOrderId,
        "system",
        "Razorpay Webhook",
        razorpayPaymentId
      );

      if (!approveRes.ok && approveRes.error !== "already_handled" && approveRes.error !== "race_condition") {
        console.error(`Failed to approve order ${internalOrderId}: ${approveRes.error}`);
        // Return 500 so Razorpay retries if it's a transient DB error
        return NextResponse.json({ error: "Internal DB error" }, { status: 500 });
      }

      console.log(`[Webhook] Order ${internalOrderId} approved successfully.`);
    } 
    else if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const internalOrderId = payment.notes?.internalOrderId;

      if (internalOrderId) {
        console.log(`[Webhook] Payment failed for order ${internalOrderId}`);
        // Optionally update the DB with a note
        await supabase
          .from("orders")
          .update({ rejection_reason: `Payment failed: ${payment.error_description}` })
          .eq("id", internalOrderId)
          .eq("status", "pending");
      }
    }
    else if (event.event === "refund.processed") {
      const paymentId = event.payload.refund.entity.payment_id;
      if (paymentId) {
        console.log(`[Webhook] Refund processed for payment ${paymentId}`);
        await supabase
          .from("orders")
          .update({ status: "refunded" })
          .eq("razorpay_payment_id", paymentId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook Error]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
