import { NextRequest, NextResponse } from "next/server";
import { getOrderByPhone, getOrderByEmail, getOrderById } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");

    if (orderId) {
      const order = await getOrderById(orderId);
      if (!order) return NextResponse.json({ orders: [] });
      return NextResponse.json({ orders: [order] });
    }
    if (phone) {
      const orders = await getOrderByPhone(phone.trim());
      return NextResponse.json({ orders });
    }
    if (email) {
      const orders = await getOrderByEmail(email.trim());
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: "provide orderId, phone, or email" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/orders/lookup]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
