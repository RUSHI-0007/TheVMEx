// ─────────────────────────────────────────────────────────────────────────────
// DATABASE LAYER — Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";
import { sendTicketEmail } from "./email";

// Initialize Supabase client. 
// Note: We use SUPABASE_SERVICE_ROLE_KEY if available (in API routes) for full access, 
// fallback to ANON_KEY (will fail for protected operations if RLS is strict).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Types ────────────────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "approved" | "rejected" | "expired" | "refunded";

export interface Order {
  id: string;
  ticket_tier_id: string;
  ticket_tier_label: string;
  quantity: number;
  base_amount: number;
  payable_amount: number;
  attendee_name: string;
  attendee_phone: string;
  attendee_email: string;
  attendee_college: string;
  attendee_year: string;
  status: OrderStatus;
  utr: string | null;
  screenshot_path: string | null;
  rejection_reason: string | null;
  handled_by_id: string | null;
  handled_by_name: string | null;
  handled_at: number | null;
  created_at: number;
  expires_at: number;
  ticket_qr_code: string | null;
  checked_in: boolean;
  checked_in_at: number | null;
  checked_in_by: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  email_sent: boolean;
  email_sent_at: number | null;
}

export interface CreateOrderInput {
  id: string;
  ticket_tier_id: string;
  ticket_tier_label: string;
  quantity: number;
  base_amount: number;
  payable_amount: number;
  attendee_name: string;
  attendee_phone: string;
  attendee_email: string;
  attendee_college: string;
  attendee_year: string;
  expires_at: number;
  razorpay_order_id?: string;
}

// ── CRUD ───────────────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const now = Math.floor(Date.now() / 1000);
  
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      ...input,
      status: 'pending',
      created_at: now,
      paise_suffix: 0 // dummy value to satisfy NOT NULL constraint from legacy UPI flow
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
    
  if (error) throw error;
  return (data as Order) ?? null;
}

export async function getOrderByPhone(phone: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("attendee_phone", phone)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function getOrderByEmail(email: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("attendee_email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function getPendingOrders(): Promise<Order[]> {
  await expireStaleOrders();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("expires_at", { ascending: true });

  if (error) throw error;
  return data as Order[];
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function submitPaymentProof(
  orderId: string,
  utr: string,
  screenshotPath: string
): Promise<{ ok: boolean; error?: string }> {
  // Check duplicate UTR
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("utr", utr)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "duplicate_utr" };
  }

  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "not_found" };
  if (order.status !== "pending") return { ok: false, error: "not_pending" };
  if (Date.now() / 1000 > order.expires_at) return { ok: false, error: "expired" };

  const { error } = await supabase
    .from("orders")
    .update({ utr, screenshot_path: screenshotPath })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function checkInventory(tierId: string): Promise<number> {
  // Count how many orders are NOT rejected/expired
  const { count, error } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("ticket_tier_id", tierId)
    .in("status", ["pending", "approved"]);

  if (error) throw error;
  return count ?? 0;
}

export async function approveOrder(
  orderId: string,
  adminId: string,
  adminName: string,
  razorpayPaymentId?: string
): Promise<{ ok: boolean; error?: string }> {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "not_found" };
  if (order.status !== "pending") return { ok: false, error: "already_handled" };

  const now = Math.floor(Date.now() / 1000);
  const ticketQr = `VMEX-${orderId}-${order.attendee_name.replace(/\s/g, "_").toUpperCase()}`;

  const { error } = await supabase
    .from("orders")
    .update({
      status: 'approved',
      handled_by_id: adminId,
      handled_by_name: adminName,
      handled_at: now,
      ticket_qr_code: ticketQr,
      ...(razorpayPaymentId ? { razorpay_payment_id: razorpayPaymentId } : {})
    })
    .eq("id", orderId)
    .eq("status", "pending"); // Prevents race condition

  if (error) return { ok: false, error: error.message };
  
  // Double check
  const updated = await getOrderById(orderId);
  if (updated?.status !== "approved" || updated.handled_by_id !== adminId) {
    return { ok: false, error: "race_condition" };
  }

  // Attempt to send email
  console.log(`[approveOrder] Sending ticket email for order ${orderId}...`);
  const emailRes = await sendTicketEmail(updated);
  if (emailRes.ok) {
    await supabase
      .from("orders")
      .update({ email_sent: true, email_sent_at: Math.floor(Date.now() / 1000) })
      .eq("id", orderId);
  } else {
    console.error(`[approveOrder] Failed to send email for order ${orderId}:`, emailRes.error);
    // Note: We don't return an error here, the order is still approved.
  }

  return { ok: true };
}

export async function rejectOrder(
  orderId: string,
  adminId: string,
  adminName: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "not_found" };
  if (order.status !== "pending") return { ok: false, error: "already_handled" };

  const now = Math.floor(Date.now() / 1000);
  
  const { error } = await supabase
    .from("orders")
    .update({
      status: 'rejected',
      handled_by_id: adminId,
      handled_by_name: adminName,
      handled_at: now,
      rejection_reason: reason
    })
    .eq("id", orderId)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  const updated = await getOrderById(orderId);
  if (updated?.status !== "rejected" || updated.handled_by_id !== adminId) {
    return { ok: false, error: "race_condition" };
  }
  return { ok: true };
}

/** Expire orders past their expiry time */
export async function expireStaleOrders(): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await supabase
    .from("orders")
    .update({ status: 'expired' })
    .eq("status", "pending")
    .lt("expires_at", now);
}

/**
 * Check in an attendee. Atomically marks the order as checked_in=true.
 * Uses optimistic concurrency (WHERE checked_in = false) to prevent double-entry.
 */
export async function checkInOrder(
  orderId: string,
  adminId: string,
  adminName: string
): Promise<{ ok: boolean; error?: string; checkedInAt?: number; order?: Order }> {
  const order = await getOrderById(orderId);
  if (!order) return { ok: false, error: "not_found" };
  if (order.status === "refunded") return { ok: false, error: "refunded" };
  if (order.status !== "approved") return { ok: false, error: "not_approved" };
  if (order.checked_in) {
    return { ok: false, error: "already_checked_in", checkedInAt: order.checked_in_at ?? undefined };
  }

  const now = Math.floor(Date.now() / 1000);

  // Atomic update — only succeeds if still not checked in (prevents race between two scanners)
  const { error } = await supabase
    .from("orders")
    .update({
      checked_in: true,
      checked_in_at: now,
      checked_in_by: `${adminId}:${adminName}`,
    })
    .eq("id", orderId)
    .eq("checked_in", false); // optimistic lock

  if (error) return { ok: false, error: error.message };

  // Verify the update actually applied
  const updated = await getOrderById(orderId);
  if (!updated?.checked_in || updated.checked_in_by !== `${adminId}:${adminName}`) {
    // Another scanner won the race
    return { ok: false, error: "already_checked_in", checkedInAt: updated?.checked_in_at ?? undefined };
  }

  return { ok: true, order: updated };
}
