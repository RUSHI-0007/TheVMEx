import { NextRequest, NextResponse } from "next/server";
import { submitPaymentProof, supabase } from "@/lib/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const utr = (formData.get("utr") as string)?.trim();
    const file = formData.get("screenshot") as File | null;

    if (!utr || utr.length < 6) {
      return NextResponse.json({ error: "invalid_utr" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "no_screenshot" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "invalid_file_type" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("payment-proofs")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Upload Error]", uploadError);
      return NextResponse.json({ error: "upload_failed" }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from("payment-proofs")
      .getPublicUrl(uploadData.path);
      
    const screenshotPath = publicUrlData.publicUrl;

    const result = await submitPaymentProof(id, utr, screenshotPath);

    if (!result.ok) {
      // Clean up uploaded file on error
      await supabase.storage.from("payment-proofs").remove([uploadData.path]);

      if (result.error === "duplicate_utr") {
        return NextResponse.json({ error: "duplicate_utr" }, { status: 409 });
      }
      if (result.error === "expired") {
        return NextResponse.json({ error: "order_expired" }, { status: 410 });
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, screenshotPath });
  } catch (err) {
    console.error("[POST /api/orders/[id]/upload]", err);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
