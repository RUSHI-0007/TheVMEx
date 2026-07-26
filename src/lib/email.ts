import { Resend } from "resend";
import QRCode from "qrcode";
import type { Order } from "./db";
import { EVENT } from "./config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketEmail(order: Order): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping email dispatch.");
      return { ok: false, error: "RESEND_API_KEY missing" };
    }

    if (!order.ticket_qr_code) {
      return { ok: false, error: "Order does not have a QR code assigned yet." };
    }

    // Generate QR Code as base64 string
    const qrDataUrl = await QRCode.toDataURL(order.ticket_qr_code, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Remove the data:image/png;base64, prefix for the attachment content
    const base64Data = qrDataUrl.split(',')[1];

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B0B0D; color: #FFFFFF; padding: 0;">
        <!-- Header -->
        <div style="text-align: center; padding: 30px 20px; background-color: #1A1A1E; border-bottom: 2px solid #D4AF37;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">${EVENT.brand}</h1>
          <p style="color: #A0A0A0; margin: 5px 0 0 0; font-size: 14px;">${EVENT.name}</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="margin-top: 0; font-size: 20px;">Hello ${order.attendee_name},</h2>
          <p style="color: #D0D0D0; line-height: 1.6; font-size: 15px;">
            Your ticket for <strong>${EVENT.name}</strong> is confirmed. We are thrilled to host you for an unforgettable evening.
          </p>

          <div style="margin: 30px 0; padding: 25px; border: 1px solid rgba(212, 175, 55, 0.3); background-color: rgba(212, 175, 55, 0.05); text-align: center;">
            <p style="margin: 0 0 15px 0; color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Your Entry Pass</p>
            
            <!-- QR Code Attachment using CID -->
            <img src="cid:ticket-qr" alt="Ticket QR Code" style="width: 200px; height: 200px; margin: 0 auto; display: block; border: 10px solid #FFFFFF; border-radius: 4px;" />
            
            <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 14px; color: #A0A0A0; letter-spacing: 1px;">
              ${order.id}
            </p>
          </div>

          <!-- Order Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 30px;">
            <tbody>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #A0A0A0; font-size: 14px;">Ticket Tier</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; font-weight: bold;">${order.ticket_tier_label} &times; ${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #A0A0A0; font-size: 14px;">Date</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; font-weight: bold;">${EVENT.date}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #A0A0A0; font-size: 14px;">Venue</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #333; text-align: right; font-weight: bold;">${EVENT.venue}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
            <h3 style="color: #D4AF37; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Important Information</h3>
            <ul style="color: #A0A0A0; font-size: 13px; line-height: 1.6; padding-left: 20px; margin-bottom: 0;">
              <li>Please present this QR code at the entry gate.</li>
              <li>Valid government-issued photo ID is mandatory.</li>
              <li>Dress code: ${EVENT.dressCode}</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; background-color: #1A1A1E; color: #666; font-size: 12px;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${EVENT.brand}. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Need help? Reply to this email.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `${EVENT.brand} Tickets <tickets@updates.thevmex.com>`, // Update to verified domain or testing domain
      to: order.attendee_email,
      subject: `Your Ticket Confirmed: ${EVENT.name}`,
      html: emailHtml,
      attachments: [
        {
          filename: 'ticket-qr.png',
          content: base64Data,
          contentId: 'ticket-qr',
        }
      ]
    });

    if (error) {
      console.error("[sendTicketEmail] Resend API Error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: any) {
    console.error("[sendTicketEmail] Exception:", err);
    return { ok: false, error: err.message ?? "Unknown error" };
  }
}
