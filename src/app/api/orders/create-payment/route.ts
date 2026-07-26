import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import Razorpay from "razorpay";
import { createOrder, checkInventory } from "@/lib/db";
import { TICKET_TIERS, EVENT } from "@/lib/config";

// Ensure Razorpay keys are configured
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay keys are missing from environment variables.");
      return NextResponse.json({ error: "server_configuration_error" }, { status: 500 });
    }

    console.log("Step 1: Init");
    const body = await req.json();
    const { tierId, quantity, attendee } = body;
    console.log("Step 2: Body parsed", tierId, quantity);

    // Validate tier
    const tier = TICKET_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
    }
    console.log("Step 3: Tier validated");

    // Validate fields
    const { name, phone, email, college, year } = attendee ?? {};
    if (!name?.trim() || !phone?.trim() || !email?.trim() || !college?.trim() || !year?.trim()) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    if (!/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "invalid_quantity" }, { status: 400 });
    }
    console.log("Step 4: Fields validated");

    // Check inventory
    const currentSold = await checkInventory(tier.id);
    console.log("Step 5: Inventory checked", currentSold);
    if (currentSold + quantity > tier.totalInventory) {
      return NextResponse.json({ error: "sold_out" }, { status: 400 });
    }

    // Calculate exact amounts (no paise suffix needed for Razorpay)
    const baseRupees = tier.price * quantity;
    const amountInPaise = baseRupees * 100;

    const orderId = `VMX-${uuidv4().slice(0, 8).toUpperCase()}`;
    const expiresAt = Math.floor(Date.now() / 1000) + EVENT.pendingExpiryMinutes * 60;
    console.log("Step 6: Razorpay init starting");

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });
    console.log("Step 7: Razorpay init complete");

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: orderId,
        notes: {
          internalOrderId: orderId,
        },
      });
    } catch (rzpErr) {
      console.error("[Razorpay Error]", rzpErr);
      return NextResponse.json({ error: "razorpay_error", details: rzpErr }, { status: 500 });
    }

    let order;
    try {
      order = await createOrder({
        id: orderId,
        ticket_tier_id: tier.id,
        ticket_tier_label: tier.label,
        quantity,
        base_amount: baseRupees,
        payable_amount: baseRupees,
        attendee_name: name.trim(),
        attendee_phone: phone.trim(),
        attendee_email: email.trim(),
        attendee_college: college.trim(),
        attendee_year: year.trim(),
        expires_at: expiresAt,
        razorpay_order_id: rzpOrder.id,
      });
    } catch (dbErr) {
      console.error("[DB Error]", dbErr);
      return NextResponse.json({ error: "db_error", details: dbErr }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      order,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId, // Sent to client to initialize checkout.js
    });
  } catch (err: any) {
    console.error("[POST /api/orders/create-payment] OUTER Error:");
    console.dir(err, { depth: null });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
