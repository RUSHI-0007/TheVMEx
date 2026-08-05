import { Resend } from 'resend';
import { EVENT } from './config';
import { formatCurrency } from './utils';

// Instantiate lazily or with a dummy key if env is missing to prevent build errors
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendTicketEmail(order: any) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("No RESEND_API_KEY set, skipping email send for order:", order.orderId);
    return;
  }

  try {
    const ticketUrl = `https://the-vmex.vercel.app/ticket?orderId=${order.orderId}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'TheVMEx <onboarding@resend.dev>';
    
    await resend.emails.send({
      from: fromEmail,
      to: order.email,
      subject: `Your Ticket for ${EVENT.name} is Confirmed! 🎉`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0b0d; color: #ede6da; border: 1px solid #d4af37; padding: 40px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #c9a24b; font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin: 0;">TheVMEx Presents</p>
            <h1 style="color: #d4af37; font-size: 32px; margin: 10px 0;">${EVENT.name}</h1>
            <p style="color: #9a948c; font-size: 14px; margin: 0;">${EVENT.date}</p>
          </div>

          <div style="background-color: #151316; border: 1px solid rgba(212, 175, 55, 0.2); padding: 25px; border-radius: 4px; margin-bottom: 30px;">
            <h2 style="color: #d4af37; font-size: 20px; margin-top: 0; text-align: center;">Ticket Confirmed</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #9a948c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Guest</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #ede6da; text-align: right; font-weight: bold;">${order.attendeeName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #9a948c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ticket ID</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #d4af37; text-align: right; font-weight: bold;">${order.ticketId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #9a948c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #ede6da; text-align: right;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #9a948c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tier</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1); color: #ede6da; text-align: right;">${order.tierName} × ${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9a948c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</td>
                <td style="padding: 10px 0; color: #ede6da; text-align: right;">${formatCurrency(order.baseAmount)}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center;">
            <p style="color: #9a948c; font-size: 14px; margin-bottom: 20px;">You will need to show your QR code at the entrance.</p>
            <a href="${ticketUrl}" style="display: inline-block; background-color: #d4af37; color: #0b0b0d; padding: 12px 24px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-radius: 2px;">View Your Ticket & QR</a>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(212, 175, 55, 0.1);">
            <p style="color: #5e5a55; font-size: 11px;">If you have any issues, please reply to this email.</p>
            <p style="color: #5e5a55; font-size: 11px;">${EVENT.name} • 21st August 2026</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Ticket sent successfully to ${order.email}`);
  } catch (error) {
    console.error("[Email] Failed to send ticket email:", error);
  }
}
