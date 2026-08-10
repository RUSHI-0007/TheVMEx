import { Resend } from 'resend';
import { EVENT } from './config';
import { formatCurrency } from './utils';
import { generateQrDataUrl, buildTicketQrPayload } from './qr';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendTicketEmail(order: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] No RESEND_API_KEY set, skipping for order:", order.orderId);
    return;
  }

  try {
    const ticketUrl = `https://thevmex.in/ticket?orderId=${order.orderId}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'TheVMEx <onboarding@resend.dev>';

    // Generate QR as inline base64 image
    const qrPayload = buildTicketQrPayload(order.ticketId, order.orderId, order.attendeeName);
    const qrDataUrl = await generateQrDataUrl(qrPayload);

    await resend.emails.send({
      from: fromEmail,
      to: order.email,
      subject: `🎭 Your Ticket is Confirmed — ${EVENT.name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Ticket — ${EVENT.name}</title>
</head>
<body style="margin:0;padding:0;background-color:#06050a;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#06050a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header Brand -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a24b;">✦ TheVMEx Presents ✦</p>
              <h1 style="margin:10px 0 4px;font-size:36px;font-weight:bold;color:#d4af37;letter-spacing:1px;">${EVENT.name}</h1>
              <p style="margin:0;font-size:13px;color:#9a948c;letter-spacing:2px;text-transform:uppercase;">${EVENT.date}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9a948c;letter-spacing:1px;">📍 ${EVENT.venue}</p>
            </td>
          </tr>

          <!-- Gold top bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#8b6914,#d4af37,#f5e07a,#d4af37,#8b6914);border-radius:2px 2px 0 0;"></td>
          </tr>

          <!-- Main ticket card -->
          <tr>
            <td style="background-color:#0f0c14;border-left:1px solid rgba(212,175,55,0.3);border-right:1px solid rgba(212,175,55,0.3);padding:32px 32px 0;">

              <!-- Confirmed badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9a948c;">Booking Confirmation</p>
                    <h2 style="margin:6px 0 0;font-size:22px;color:#d4af37;">Your seat is secured 🎉</h2>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;font-size:10px;letter-spacing:2px;text-transform:uppercase;border:1px solid rgba(52,211,153,0.5);color:#34d399;padding:5px 12px;border-radius:50px;background:rgba(52,211,153,0.08);">✓ Confirmed</span>
                  </td>
                </tr>
              </table>

              <!-- Guest name hero box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(212,175,55,0.05);border:1px solid rgba(212,175,55,0.15);border-radius:4px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#5e5a55;">Guest Name</p>
                    <p style="margin:0;font-size:24px;font-weight:bold;color:#ede6da;">${order.attendeeName}</p>
                  </td>
                </tr>
              </table>

              <!-- Details grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding:10px 10px 10px 0;border-bottom:1px solid rgba(212,175,55,0.08);">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;">Ticket ID</p>
                    <p style="margin:0;font-size:15px;font-weight:bold;color:#d4af37;">${order.ticketId}</p>
                  </td>
                  <td width="50%" style="padding:10px 0 10px 10px;border-bottom:1px solid rgba(212,175,55,0.08);">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;">Order ID</p>
                    <p style="margin:0;font-size:13px;color:#9a948c;font-family:monospace;">${order.orderId}</p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:10px 10px 10px 0;border-bottom:1px solid rgba(212,175,55,0.08);">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;">Tier</p>
                    <p style="margin:0;font-size:14px;color:#ede6da;">${order.tierName} × ${order.quantity}</p>
                  </td>
                  <td width="50%" style="padding:10px 0 10px 10px;border-bottom:1px solid rgba(212,175,55,0.08);">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;">Amount Paid</p>
                    <p style="margin:0;font-size:14px;color:#ede6da;">${formatCurrency(order.baseAmount)}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:10px 0;">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;">Dress Code</p>
                    <p style="margin:0;font-size:13px;color:#9a948c;">${EVENT.dressCode}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Perforated tear line -->
          <tr>
            <td style="background-color:#0f0c14;border-left:1px solid rgba(212,175,55,0.3);border-right:1px solid rgba(212,175,55,0.3);padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="16" style="width:16px;"><div style="width:16px;height:16px;background:#06050a;border-radius:50%;border-right:1px solid rgba(212,175,55,0.3);"></div></td>
                  <td style="border-top:2px dashed rgba(212,175,55,0.2);height:1px;"></td>
                  <td width="16" style="width:16px;"><div style="width:16px;height:16px;background:#06050a;border-radius:50%;border-left:1px solid rgba(212,175,55,0.3);"></div></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code stub -->
          <tr>
            <td style="background:linear-gradient(180deg,#0e0b13 0%,#080509 100%);border-left:1px solid rgba(212,175,55,0.3);border-right:1px solid rgba(212,175,55,0.3);padding:28px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 16px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#5e5a55;">Show at Entry Gate</p>
                    <!-- QR Code embedded inline -->
                    <div style="display:inline-block;background:#ffffff;padding:12px;border-radius:4px;border:1px solid rgba(212,175,55,0.4);box-shadow:0 0 30px rgba(212,175,55,0.2);">
                      <img src="${qrDataUrl}" alt="Ticket QR Code" width="200" height="200" style="display:block;width:200px;height:200px;" />
                    </div>
                    <p style="margin:14px 0 0;font-size:11px;color:#34d399;letter-spacing:2px;text-transform:uppercase;">● Valid for ${order.quantity} entr${order.quantity > 1 ? 'ies' : 'y'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold bottom bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,#8b6914,#d4af37,#f5e07a,#d4af37,#8b6914);border-radius:0 0 2px 2px;"></td>
          </tr>

          <!-- View ticket CTA -->
          <tr>
            <td align="center" style="padding:28px 16px;">
              <p style="margin:0 0 16px;font-size:13px;color:#9a948c;">Can't see the QR? View your full digital ticket online:</p>
              <a href="${ticketUrl}" style="display:inline-block;background:linear-gradient(135deg,#c9a24b,#d4af37,#f5e07a,#d4af37);color:#0b0b0d;padding:14px 32px;text-decoration:none;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:2px;border-radius:2px;">
                View My Ticket →
              </a>
            </td>
          </tr>

          <!-- Info strip -->
          <tr>
            <td style="background-color:#0f0c14;border:1px solid rgba(212,175,55,0.1);border-radius:4px;padding:20px 24px;margin:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 12px;">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;margin-bottom:4px;">📅 Event Details</p>
                    <p style="margin:0;font-size:13px;color:#ede6da;">${EVENT.date} &nbsp;·&nbsp; ${EVENT.venue}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5e5a55;margin-bottom:4px;">⚠️ Important</p>
                    <p style="margin:0;font-size:12px;color:#9a948c;line-height:1.6;">
                      Bring a valid government-issued photo ID. Tickets are non-transferable — name on ticket must match your ID. Entry subject to capacity.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:8px 16px 0;">
              <p style="margin:0 0 4px;font-size:11px;color:#3a3836;">Questions? Reply to this email or WhatsApp us.</p>
              <p style="margin:0;font-size:11px;color:#3a3836;">${EVENT.name} &nbsp;·&nbsp; TheVMEx &nbsp;·&nbsp; thevmex.in</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    console.log(`[Email] Ticket sent to ${order.email} for order ${order.orderId}`);
  } catch (error) {
    console.error("[Email] Failed to send ticket email:", error);
  }
}
