import { NextRequest, NextResponse } from "next/server";
import { approveOrder } from "@/lib/orders";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: orderId } = await params;

  try {
    const order = await approveOrder(
      orderId,
      session.adminId,
      session.adminName
    );
    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to approve order";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
