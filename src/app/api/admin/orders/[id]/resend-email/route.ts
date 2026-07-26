import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getOrderById, supabase } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = await verifyAdminSession(cookieStore);
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    if (order.status !== "approved") {
      return NextResponse.json({ error: "Order is not approved yet" }, { status: 400 });
    }

    const emailRes = await sendTicketEmail(order);

    if (emailRes.ok) {
      // Update DB to reflect successful email send
      await supabase
        .from("orders")
        .update({ email_sent: true, email_sent_at: Math.floor(Date.now() / 1000) })
        .eq("id", order.id);

      return NextResponse.json({ ok: true });
    } else {
      // Update DB to reflect failure if needed
      await supabase
        .from("orders")
        .update({ email_sent: false })
        .eq("id", order.id);

      return NextResponse.json({ ok: false, error: emailRes.error }, { status: 500 });
    }
  } catch (err) {
    console.error("[POST /api/admin/orders/[id]/resend-email]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
