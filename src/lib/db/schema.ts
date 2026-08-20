import { pgTable, text, integer, real, index, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull().unique(),
    ticketTierId: text("ticket_tier_id").notNull(),
    quantity: integer("quantity").notNull(),
    baseAmount: real("base_amount").notNull(),
    payableAmount: real("payable_amount").notNull(),
    attendeeName: text("attendee_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    college: text("college").notNull(),
    year: text("year").notNull(),
    guests: jsonb("guests"),
    utr: text("utr").unique(),
    screenshotPath: text("screenshot_path"),
    cashfreeOrderId: text("cashfree_order_id"),
    paymentMode: text("payment_mode")
      .$type<"upi_manual" | "cashfree">()
      .notNull()
      .default("upi_manual"),
    status: text("status")
      .$type<"draft" | "pending_verification" | "approved" | "rejected" | "expired">()
      .notNull()
      .default("draft"),
    expiresAt: text("expires_at"),
    ticketId: text("ticket_id"),
    handledBy: text("handled_by"),
    handledByName: text("handled_by_name"),
    handledAt: text("handled_at"),
    rejectionReason: text("rejection_reason"),
    claimedBy: text("claimed_by"),
    claimedByName: text("claimed_by_name"),
    claimedAt: text("claimed_at"),
    checkedIn: boolean("checked_in").default(false),
    checkedInAt: text("checked_in_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("orders_status_idx").on(table.status),
    index("orders_payable_amount_idx").on(table.payableAmount),
    index("orders_phone_idx").on(table.phone),
    index("orders_email_idx").on(table.email),
  ]
);

export const orderAuditLog = pgTable("order_audit_log", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  action: text("action").notNull(),
  adminId: text("admin_id"),
  adminName: text("admin_name"),
  details: text("details"),
  createdAt: text("created_at").notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// ─── Guest List (offline / VIP attendees) ─────────────────────────────────────
export const guestList = pgTable(
  "guest_list",
  {
    id:          text("id").primaryKey(),
    name:        text("name").notNull(),
    // Normalized lookup keys — computed as lower(trim(value)) on write.
    // DB enforces uniqueness so no duplicate rows from whitespace/casing drift.
    nameKey:     text("name_key").notNull(),
    phone:       text("phone").notNull().default(""),
    source:      text("source").notNull(),
    sourceKey:   text("source_key").notNull(),
    checkedIn:   boolean("checked_in").notNull().default(false),
    checkedInAt: text("checked_in_at"),          // nullable ISO string
    uploadedAt:  text("uploaded_at").notNull(),
  },
  (t) => [
    uniqueIndex("guest_list_key_idx").on(t.nameKey, t.sourceKey),
    index("guest_list_source_idx").on(t.sourceKey),
  ]
);

export type GuestListEntry    = typeof guestList.$inferSelect;
export type NewGuestListEntry = typeof guestList.$inferInsert;
