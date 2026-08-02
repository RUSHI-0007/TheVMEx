import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, inArray } from "drizzle-orm";
import { getTicketTier } from "@/lib/utils";
import type { TicketTierId } from "@/lib/config";

/**
 * GET /api/admin/export?status=approved,pending_verification,all
 * Returns a CSV of all attendee records for venue management.
 * Protected — admin session required.
 */
export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status") ?? "approved";

    type OrderStatus = "approved" | "pending_verification" | "rejected" | "expired" | "draft";

    let statusFilter: OrderStatus[];
    if (statusParam === "all") {
      statusFilter = ["approved", "pending_verification", "rejected", "expired", "draft"];
    } else {
      statusFilter = statusParam.split(",").filter((s): s is OrderStatus =>
        ["approved", "pending_verification", "rejected", "expired", "draft"].includes(s)
      );
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(orders)
      .where(inArray(orders.status, statusFilter))
      .orderBy(desc(orders.createdAt));

    // Build CSV
    const headers = [
      "Order ID",
      "Ticket ID",
      "Status",
      "Payment Mode",
      "Attendee Name",
      "Phone",
      "Email",
      "College",
      "Year",
      "Tier",
      "Quantity",
      "Guests",
      "Amount Paid (₹)",
      "UTR",
      "Booked At",
      "Approved At",
      "Handled By",
    ];

    const csvRows = rows.map((row) => {
      const tier = getTicketTier(row.ticketTierId as TicketTierId);
      // Guests = quantity × people per ticket
      const guestsPerTicket =
        row.ticketTierId === "stag" ? 1 : row.ticketTierId === "couple" ? 2 : 4;
      const totalGuests = row.quantity * guestsPerTicket;

      return [
        row.orderId,
        row.ticketId ?? "",
        row.status,
        row.paymentMode ?? "upi_manual",
        row.attendeeName,
        row.phone,
        row.email,
        row.college,
        row.year,
        tier?.label ?? row.ticketTierId,
        row.quantity,
        totalGuests,
        row.payableAmount.toFixed(2),
        row.utr ?? "",
        formatISTDate(row.createdAt),
        row.handledAt ? formatISTDate(row.handledAt) : "",
        row.handledByName ?? "",
      ].map(escapeCsvCell).join(",");
    });

    const csv = [headers.join(","), ...csvRows].join("\n");
    const filename = `masquerade-attendees-${statusParam}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatISTDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
