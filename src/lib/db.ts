// ─────────────────────────────────────────────────────────────────────────────
// DATABASE LAYER — Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client. 
// Note: We use SUPABASE_SERVICE_ROLE_KEY if available (in API routes) for full access, 
// fallback to ANON_KEY (will fail for protected operations if RLS is strict).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Types ────────────────────────────────────────────────────────────────────
export type OrderStatus = "pending" | "approved" | "rejected" | "expired";

export interface Order {
  id: string;
  ticket_tier_id: string;
  ticket_tier_label: string;
  quantity: number;
  base_amount: number;
  payable_amount: string;
  paise_suffix: number;
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
}

export interface CreateOrderInput {
  id: string;
  ticket_tier_id: string;
  ticket_tier_label: string;
  quantity: number;
  base_amount: number;
  payable_amount: string;
  paise_suffix: number;
  attendee_name: string;
  attendee_phone: string;
  attendee_email: string;
  attendee_college: string;
  attendee_year: string;
  expires_at: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Generate a unique 2-digit paise suffix not colliding with pending orders */
export async function generateUniquePaiseSuffix(basePaiseSuffix?: number): Promise<number> {
  const { data, error } = await supabase
    .from("orders")
    .select("paise_suffix")
    .eq("status", "pending");

  if (error) throw error;

  const used = new Set(data.map((r) => r.paise_suffix));

  if (basePaiseSuffix !== undefined && !used.has(basePaiseSuffix)) {
    return basePaiseSuffix;
  }

  // Random 2-digit paise: 01–99
  let attempts = 0;
  while (attempts < 200) {
    const suffix = Math.floor(Math.random() * 99) + 1;
    if (!used.has(suffix)) return suffix;
    attempts++;
  }
  throw new Error("Could not generate unique paise suffix — too many pending orders");
}

/** Format payable amount string: base rupees + paise suffix */
export function formatPayableAmount(baseRupees: number, paiseSuffix: number): string {
  return `${baseRupees}.${String(paiseSuffix).padStart(2, "0")}`;
}

// ── CRUD ───────────────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const now = Math.floor(Date.now() / 1000);
  
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      ...input,
      status: 'pending',
      created_at: now
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

export async function approveOrder(
  orderId: string,
  adminId: string,
  adminName: string
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
      ticket_qr_code: ticketQr
    })
    .eq("id", orderId)
    .eq("status", "pending"); // Prevents race condition

  if (error) return { ok: false, error: error.message };
  
  // Double check
  const updated = await getOrderById(orderId);
  if (updated?.status !== "approved" || updated.handled_by_id !== adminId) {
    return { ok: false, error: "race_condition" };
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
