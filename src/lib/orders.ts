import { eq, and, or, inArray, sql, desc, ne } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { orders, orderAuditLog } from "./db/schema";
import {
  TICKET_TIERS,
  PAYMENT,
  type TicketTierId,
} from "@/lib/config";
import {
  generateOrderId,
  generateTicketId,
  getTicketTier,
} from "./utils";
import { sendTicketEmail } from "./email";
export async function getSoldCount(tierId: TicketTierId): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.quantity}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.ticketTierId, tierId),
        inArray(orders.status, ["pending_verification", "approved"])
      )
    );
  return result[0]?.total ?? 0;
}

export async function getTierAvailability() {
  const availability = await Promise.all(
    TICKET_TIERS.map(async (tier) => {
      const sold = await getSoldCount(tier.id);
      const remaining = Math.max(0, tier.totalInventory - sold);
      return {
        ...tier,
        sold,
        remaining,
        soldOut: remaining === 0,
      };
    })
  );
  return availability;
}

async function getPendingPayableAmounts(): Promise<number[]> {
  const db = getDb();
  const now = new Date().toISOString();
  const pending = await db
    .select({ payableAmount: orders.payableAmount })
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending_verification"),
        sql`${orders.expiresAt} > ${now}`
      )
    );
  return pending.map((p) => p.payableAmount);
}

export async function generateUniquePayableAmount(
  baseAmount: number
): Promise<number> {
  // Removing paise generation as per user request to keep flat amount
  return baseAmount;
}

export interface CreateOrderInput {
  ticketTierId: TicketTierId;
  quantity: number;
  attendeeName: string;
  phone: string;
  email: string;
  guests?: any[];
  cashfreeOrderId?: string;
  paymentMode?: "upi_manual" | "cashfree";
}

export async function createOrder(input: CreateOrderInput) {
  const tier = getTicketTier(input.ticketTierId);
  if (!tier) throw new Error("Invalid ticket tier");

  const availability = await getTierAvailability();
  const tierAvail = availability.find((t) => t.id === input.ticketTierId);
  if (!tierAvail || tierAvail.remaining < input.quantity) {
    throw new Error("Insufficient tickets available");
  }

  if (input.quantity > 10) {
    throw new Error(`Maximum 10 tickets per order for this tier`);
  }

  const baseAmount = tier.price * input.quantity;
  const payableAmount = await generateUniquePayableAmount(baseAmount);
  const now = new Date();
  // 5 hours — UTR + screenshot are always submitted together at booking time
  const expiresAt = new Date(
    now.getTime() + 5 * 60 * 60 * 1000
  );

  const db = getDb();
  const order = {
    id: uuidv4(),
    orderId: generateOrderId(),
    ticketTierId: input.ticketTierId,
    quantity: input.quantity,
    baseAmount,
    payableAmount,
    attendeeName: input.attendeeName.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    college: "",
    year: "",
    guests: input.guests ?? [],
    cashfreeOrderId: input.cashfreeOrderId ?? null,
    paymentMode: (input.paymentMode ?? "upi_manual") as "upi_manual" | "cashfree",
    status: "pending_verification" as const,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  await db.insert(orders).values(order);
  await logAudit(order.orderId, "created", null, null, "Order created");

  return order;
}

export async function submitPaymentProof(
  orderId: string,
  utr: string,
  screenshotPath: string
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1);

  if (!existing[0]) throw new Error("Order not found");
  const order = existing[0];

  const utrExists = await db
    .select()
    .from(orders)
    .where(and(eq(orders.utr, utr.trim()), ne(orders.orderId, orderId)))
    .limit(1);

  if (utrExists[0]) {
    throw new Error("This UTR has already been used for another order");
  }

  const now = new Date().toISOString();
  // Extend expiry by 7 days once UTR is submitted so admin has time to verify
  const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .update(orders)
    .set({
      utr: utr.trim(),
      screenshotPath,
      expiresAt: newExpiry,
      updatedAt: now,
    })
    .where(eq(orders.orderId, orderId));

  await logAudit(
    orderId,
    "payment_submitted",
    null,
    null,
    `UTR: ${utr.trim()}`
  );

  return { ...order, utr: utr.trim(), screenshotPath };
}

export async function expireOrder(orderId: string) {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .update(orders)
    .set({ status: "expired", updatedAt: now })
    .where(
      and(
        eq(orders.orderId, orderId),
        eq(orders.status, "pending_verification")
      )
    );
  await logAudit(orderId, "expired", null, null, "Order expired");
}

export async function expireStaleOrders() {
  const db = getDb();
  const now = new Date().toISOString();
  const stale = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending_verification"),
        sql`${orders.expiresAt} <= ${now}`
      )
    );

  for (const order of stale) {
    await expireOrder(order.orderId);
  }
  return stale.length;
}

export async function getOrderByOrderId(orderId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.orderId, orderId))
    .limit(1);
  return result[0] ?? null;
}

export async function getOrderByCashfreeId(cfOrderId: string) {
  const db = getDb();
  const result = await db
    .select()
    .from(orders)
    .where(eq(orders.cashfreeOrderId, cfOrderId))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Auto-approve an order triggered by a Cashfree webhook.
 * Does NOT require an admin actor — Cashfree is the authority.
 */
export async function approveByCashfree(orderId: string): Promise<ReturnType<typeof getOrderByOrderId>> {
  const db = getDb();
  const now = new Date().toISOString();
  const ticketId = generateTicketId();

  const result = await db
    .update(orders)
    .set({
      status: "approved",
      ticketId,
      handledBy: "cashfree",
      handledByName: "Cashfree Gateway",
      handledAt: now,
      claimedBy: null,
      claimedByName: null,
      claimedAt: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(orders.orderId, orderId),
        eq(orders.status, "pending_verification")
      )
    )
    .returning();

  if (result.length === 0) {
    // Already processed — idempotent, not an error
    return getOrderByOrderId(orderId);
  }

  await logAudit(orderId, "approved", "cashfree", "Cashfree Gateway", `Ticket: ${ticketId}`);
  const approvedOrder = await getOrderByOrderId(orderId);
  if (approvedOrder) {
    sendTicketEmail(approvedOrder).catch(console.error);
  }
  return approvedOrder;
}

export async function lookupOrder(query: string) {
  const db = getDb();
  const normalized = query.trim();
  const result = await db
    .select()
    .from(orders)
    .where(
      or(
        eq(orders.orderId, normalized.toUpperCase()),
        eq(orders.phone, normalized),
        eq(orders.email, normalized.toLowerCase()),
        eq(orders.ticketId, normalized.toUpperCase())
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(5);
  return result;
}

export async function getPendingOrders() {
  await expireStaleOrders();
  const db = getDb();
  const now = new Date().toISOString();
  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending_verification"),
        sql`${orders.expiresAt} > ${now}`
      )
    )
    .orderBy(orders.payableAmount);
}

export async function claimOrder(
  orderId: string,
  adminId: string,
  adminName: string
) {
  const db = getDb();
  const now = new Date().toISOString();
  const claimExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const existing = await getOrderByOrderId(orderId);
  if (!existing) throw new Error("Order not found");
  if (existing.status !== "pending_verification") {
    throw new Error("Order is no longer pending");
  }

  if (
    existing.claimedBy &&
    existing.claimedBy !== adminId &&
    existing.claimedAt &&
    new Date(existing.claimedAt) > new Date(Date.now() - 5 * 60 * 1000)
  ) {
    throw new Error(`Already claimed by ${existing.claimedByName}`);
  }

  await db
    .update(orders)
    .set({
      claimedBy: adminId,
      claimedByName: adminName,
      claimedAt: claimExpiry,
      updatedAt: now,
    })
    .where(
      and(
        eq(orders.orderId, orderId),
        eq(orders.status, "pending_verification")
      )
    );

  return getOrderByOrderId(orderId);
}

export async function approveOrder(
  orderId: string,
  adminId: string,
  adminName: string
) {
  const db = getDb();
  const now = new Date().toISOString();
  const ticketId = generateTicketId();

  const result = await db
    .update(orders)
    .set({
      status: "approved",
      ticketId,
      handledBy: adminId,
      handledByName: adminName,
      handledAt: now,
      claimedBy: null,
      claimedByName: null,
      claimedAt: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(orders.orderId, orderId),
        eq(orders.status, "pending_verification")
      )
    )
    .returning();

  if (result.length === 0) {
    const order = await getOrderByOrderId(orderId);
    if (order?.status === "approved") {
      throw new Error(
        `Already approved by ${order.handledByName ?? "another team member"}`
      );
    }
    if (order?.status === "rejected") {
      throw new Error(
        `Already rejected by ${order.handledByName ?? "another team member"}`
      );
    }
    throw new Error("Order could not be approved");
  }

  await logAudit(orderId, "approved", adminId, adminName, `Ticket: ${ticketId}`);
  const approvedOrder = await getOrderByOrderId(orderId);
  if (approvedOrder) {
    sendTicketEmail(approvedOrder).catch(console.error);
  }
  return approvedOrder;
}

export async function rejectOrder(
  orderId: string,
  adminId: string,
  adminName: string,
  reason: string
) {
  const db = getDb();
  const now = new Date().toISOString();

  const result = await db
    .update(orders)
    .set({
      status: "rejected",
      rejectionReason: reason,
      handledBy: adminId,
      handledByName: adminName,
      handledAt: now,
      claimedBy: null,
      claimedByName: null,
      claimedAt: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(orders.orderId, orderId),
        eq(orders.status, "pending_verification")
      )
    )
    .returning();

  if (result.length === 0) {
    const order = await getOrderByOrderId(orderId);
    if (order?.handledByName) {
      throw new Error(`Already handled by ${order.handledByName}`);
    }
    throw new Error("Order could not be rejected");
  }

  await logAudit(orderId, "rejected", adminId, adminName, reason);
  return getOrderByOrderId(orderId);
}

export async function getOrderAuditLog(orderId: string) {
  const db = getDb();
  return db
    .select()
    .from(orderAuditLog)
    .where(eq(orderAuditLog.orderId, orderId))
    .orderBy(desc(orderAuditLog.createdAt));
}

async function logAudit(
  orderId: string,
  action: string,
  adminId: string | null,
  adminName: string | null,
  details: string | null
) {
  const db = getDb();
  await db.insert(orderAuditLog).values({
    id: uuidv4(),
    orderId,
    action,
    adminId,
    adminName,
    details,
    createdAt: new Date().toISOString(),
  });
}

export function buildUpiUrl(
  upiId: string,
  payeeName: string,
  amount: number,
  orderId: string
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: orderId,
  });
  return `upi://pay?${params.toString()}`;
}
