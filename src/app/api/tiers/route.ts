import { NextResponse } from "next/server";
import { getTierAvailability } from "@/lib/orders";

export async function GET() {
  try {
    const tiers = await getTierAvailability();
    return NextResponse.json({ tiers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch tiers" },
      { status: 500 }
    );
  }
}
