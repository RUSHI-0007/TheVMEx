import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, getOrderByOrderId } from "@/lib/orders";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import { createCashfreeOrder } from "@/lib/cashfree";

const createOrderSchema = z.object({
  ticketTierId: z.enum(["earlybird"]),
  quantity: z.number().int().min(1).max(10),
  attendeeName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
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
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Create the DB order (status = pending_verification by default)
    const order = await createOrder({
      ticketTierId: data.ticketTierId,
      quantity: data.quantity,
      attendeeName: data.attendeeName,
      phone: data.phone,
      email: data.email,
      paymentMode: "cashfree",
    });

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_BASE_URL ??
      "https://thevmex.in";

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

  } catch (error: any) {
    console.error("[POST /api/orders] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create order";
    
    // Extract Axios-specific details if it's an AxiosError (Cashfree SDK uses Axios)
    const axiosData = error.isAxiosError ? {
      url: error.config?.url,
      responseData: error.response?.data,
      status: error.response?.status,
    } : undefined;

    return NextResponse.json({ 
      error: message, 
      axiosDetails: axiosData,
      raw: String(error) 
    }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
