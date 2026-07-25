import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createOrder,
  generateUniquePaiseSuffix,
  formatPayableAmount,
} from "@/lib/db";
import { TICKET_TIERS, EVENT } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tierId, quantity, attendee } = body;

    // Validate tier
    const tier = TICKET_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
    }

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

    // Generate unique paise suffix
    const paiseSuffix = await generateUniquePaiseSuffix();
    const baseRupees = tier.price * quantity;
    const payableAmount = formatPayableAmount(baseRupees, paiseSuffix);

    const orderId = `VMX-${uuidv4().slice(0, 8).toUpperCase()}`;
    const expiresAt = Math.floor(Date.now() / 1000) + EVENT.pendingExpiryMinutes * 60;

    const order = await createOrder({
      id: orderId,
      ticket_tier_id: tier.id,
      ticket_tier_label: tier.label,
      quantity,
      base_amount: baseRupees,
      payable_amount: payableAmount,
      paise_suffix: paiseSuffix,
      attendee_name: name.trim(),
      attendee_phone: phone.trim(),
      attendee_email: email.trim(),
      attendee_college: college.trim(),
      attendee_year: year.trim(),
      expires_at: expiresAt,
    });

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
