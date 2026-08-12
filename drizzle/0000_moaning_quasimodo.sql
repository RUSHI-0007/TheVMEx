CREATE TABLE "order_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"action" text NOT NULL,
	"admin_id" text,
	"admin_name" text,
	"details" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"ticket_tier_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"base_amount" real NOT NULL,
	"payable_amount" real NOT NULL,
	"attendee_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"college" text NOT NULL,
	"year" text NOT NULL,
	"guests" jsonb,
	"utr" text,
	"screenshot_path" text,
	"cashfree_order_id" text,
	"payment_mode" text DEFAULT 'upi_manual' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"expires_at" text,
	"ticket_id" text,
	"handled_by" text,
	"handled_by_name" text,
	"handled_at" text,
	"rejection_reason" text,
	"claimed_by" text,
	"claimed_by_name" text,
	"claimed_at" text,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id"),
	CONSTRAINT "orders_utr_unique" UNIQUE("utr")
);
--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_payable_amount_idx" ON "orders" USING btree ("payable_amount");--> statement-breakpoint
CREATE INDEX "orders_phone_idx" ON "orders" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");