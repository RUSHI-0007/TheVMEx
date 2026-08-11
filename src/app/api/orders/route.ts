import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, buildUpiUrl } from "@/lib/orders";
import { PAYMENT } from "@/lib/config";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import path from "path";
import { submitPaymentProof } from "@/lib/orders";

const createOrderSchema = z.object({
  ticketTierId: z.enum(["earlybird"]),
  quantity: z.number().int().min(1).max(10),
  attendeeName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse as FormData — contains both order fields AND payment proof
    const formData = await request.formData();

    const body = {
      ticketTierId: formData.get("ticketTierId"),
      quantity: Number(formData.get("quantity")),
      attendeeName: formData.get("attendeeName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
    };

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (!isValidPhone(data.phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Validate UTR
    const utr = formData.get("utr") as string;
    if (!utr?.trim()) {
      return NextResponse.json({ error: "UTR / reference number is required" }, { status: 400 });
    }

    // Validate screenshot
    const screenshot = formData.get("screenshot") as File | null;
    if (!screenshot) {
      return NextResponse.json({ error: "Payment screenshot is required" }, { status: 400 });
    }
    if (!screenshot.type.startsWith("image/")) {
      return NextResponse.json({ error: "Screenshot must be an image file" }, { status: 400 });
    }
    if (screenshot.size > PAYMENT.maxScreenshotSizeMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `File must be under ${PAYMENT.maxScreenshotSizeMb}MB` },
        { status: 400 }
      );
    }

    // Create order (goes directly to pending_verification)
    const order = await createOrder({
      ticketTierId: data.ticketTierId,
      quantity: data.quantity,
      attendeeName: data.attendeeName,
      phone: data.phone,
      email: data.email,
      paymentMode: "upi_manual",
    });

    // Attach payment proof immediately
    const mimeType = screenshot.type || "image/jpeg";
    const buffer = Buffer.from(await screenshot.arrayBuffer());
    const base64 = buffer.toString("base64");
    const screenshotDataUrl = `data:${mimeType};base64,${base64}`;

    const updatedOrder = await submitPaymentProof(order.orderId, utr.trim(), screenshotDataUrl);

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("[POST /api/orders] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    const isUtrDuplicate = message.includes("UTR");
    const userMessage = isUtrDuplicate
      ? "This UTR has already been submitted. Your booking may have already gone through — please check your ticket status at thevmex.in/ticket or contact us on WhatsApp."
      : message;
    const status = isUtrDuplicate ? 409 : 400;
    return NextResponse.json({ error: userMessage }, { status });
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  try {
    const { getOrderByOrderId } = await import("@/lib/orders");
    const order = await getOrderByOrderId(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
