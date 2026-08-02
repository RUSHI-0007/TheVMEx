import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { submitPaymentProof } from "@/lib/orders";
import { getUploadsDir } from "@/lib/db";
import { PAYMENT } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderId = formData.get("orderId") as string;
    const utr = formData.get("utr") as string;
    const screenshot = formData.get("screenshot") as File | null;

    if (!orderId || !utr?.trim()) {
      return NextResponse.json(
        { error: "Order ID and UTR are required" },
        { status: 400 }
      );
    }

    if (!screenshot) {
      return NextResponse.json(
        { error: "Payment screenshot is required" },
        { status: 400 }
      );
    }

    if (!screenshot.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Screenshot must be an image file" },
        { status: 400 }
      );
    }

    if (screenshot.size > PAYMENT.maxScreenshotSizeMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `File must be under ${PAYMENT.maxScreenshotSizeMb}MB` },
        { status: 400 }
      );
    }

    const ext = path.extname(screenshot.name) || ".jpg";
    const filename = `${uuidv4()}${ext}`;
    const uploadsDir = getUploadsDir();
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await screenshot.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const relativePath = `/api/uploads/${filename}`;
    const order = await submitPaymentProof(orderId, utr, relativePath);

    return NextResponse.json({ order });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to submit payment";
    const status = message.includes("UTR") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
