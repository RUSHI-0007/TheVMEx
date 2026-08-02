import { TICKET_TIERS, type TicketTierId } from "@/lib/config";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPayableAmount(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function getTicketTier(id: TicketTierId) {
  return TICKET_TIERS.find((t) => t.id === id);
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VMX-${code}`;
}

export function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TKT-${code}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(digits);
}
