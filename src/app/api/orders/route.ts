import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createOrder,
  buildUpiUrl,
  getOrderByOrderId,
} from "@/lib/orders";
import { generateQrDataUrl } from "@/lib/qr";
import { PAYMENT } from "@/lib/config";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import { isCashfreeEnabled, createCashfreeOrder } from "@/lib/cashfree";

const createOrderSchema = z.object({
  ticketTierId: z.enum(["stag", "couple", "group"]),
  quantity: z.number().int().min(1).max(10),
  attendeeName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  college: z.string().min(2).max(150),
  year: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (!isValidPhone(data.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }
    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // --- Cashfree flow ---
    if (isCashfreeEnabled()) {
      // Create the DB order first (we need our orderId for Cashfree)
      const order = await createOrder({
        ticketTierId: data.ticketTierId,
        quantity: data.quantity,
        attendeeName: data.attendeeName,
        phone: data.phone,
        email: data.email,
        college: data.college,
        year: data.year,
        paymentMode: "cashfree",
      });

      const origin =
        request.headers.get("origin") ??
        process.env.NEXT_PUBLIC_BASE_URL ??
        "https://the-vmex.vercel.app";

      const returnUrl = `${origin}/api/cashfree/return?orderId=${order.orderId}`;

      const cashfreeResult = await createCashfreeOrder({
        orderId: order.orderId,
        amount: order.payableAmount,
        customerName: order.attendeeName,
        customerPhone: order.phone,
        customerEmail: order.email,
        returnUrl,
      });

      // Persist the Cashfree order id back to the DB row
      const { getDb } = await import("@/lib/db");
      const { orders } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");
      const db = getDb();
      await db
        .update(orders)
        .set({ cashfreeOrderId: cashfreeResult.cfOrderId })
        .where(eq(orders.orderId, order.orderId));

      return NextResponse.json({
        order: { ...order, cashfreeOrderId: cashfreeResult.cfOrderId },
        paymentSessionId: cashfreeResult.paymentSessionId,
        mode: "cashfree",
      });
    }

    // --- Legacy UPI manual flow ---
    const order = await createOrder({
      ticketTierId: data.ticketTierId,
      quantity: data.quantity,
      attendeeName: data.attendeeName,
      phone: data.phone,
      email: data.email,
      college: data.college,
      year: data.year,
      paymentMode: "upi_manual",
    });

    const upiUrl = buildUpiUrl(
      PAYMENT.upiId,
      PAYMENT.upiName,
      order.payableAmount,
      order.orderId
    );
    const upiQr = await generateQrDataUrl(upiUrl);

    return NextResponse.json({ order, upiQr, upiUrl, mode: "upi_manual" });
  } catch (error) {
    console.error("[POST /api/orders] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({ error: message, stack, raw: String(error) }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  try {
    const order = await getOrderByOrderId(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
