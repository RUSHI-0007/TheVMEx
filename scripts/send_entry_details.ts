import { Resend } from 'resend';
import { getDb } from '../src/lib/db';
import { orders } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error("No RESEND_API_KEY found in .env.local!");
    process.exit(1);
  }

  const db = getDb();
  
  // Get all approved orders
  const approvedOrders = await db.select({
    email: orders.email
  }).from(orders).where(eq(orders.status, 'approved'));

  // Get unique emails
  const uniqueEmails = Array.from(new Set(approvedOrders.map(o => o.email.toLowerCase().trim())));

  console.log(`Found ${approvedOrders.length} approved orders.`);
  console.log(`Found ${uniqueEmails.length} unique buyer emails.`);

  if (uniqueEmails.length === 0) {
    console.log("No emails to send to.");
    process.exit(0);
  }

  // Resend BCC limit per API call is 50. Let's chunk them into groups of 40.
  const chunkSize = 40;
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'TheVMEx <onboarding@resend.dev>';

  for (let i = 0; i < uniqueEmails.length; i += chunkSize) {
    const chunk = uniqueEmails.slice(i, i + chunkSize);
    console.log(`Sending to chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} emails)`);

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: fromEmail, // send to ourselves
        bcc: chunk,    // BCC the buyers
        subject: "Masquerade Night — Entry Details (Today, 5:00 PM)",
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Masquerade Night — Entry Details</title>
</head>
<body style="margin:0;padding:0;background-color:#06050a;font-family:'Helvetica Neue',Arial,sans-serif;color:#ede6da;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#06050a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0f0c14;border:1px solid rgba(212,175,55,0.3);padding:32px;border-radius:4px;">
          <tr>
            <td>
              <p style="font-size:16px;color:#ede6da;line-height:1.5;">Hi,</p>
              <p style="font-size:16px;color:#ede6da;line-height:1.5;">Thanks for booking your ticket to <strong>Masquerade Night</strong>! Here are a few quick details before you arrive.</p>

              <h3 style="color:#d4af37;letter-spacing:1px;margin-top:24px;text-transform:uppercase;font-size:14px;">Event Details</h3>
              <ul style="font-size:16px;color:#ede6da;line-height:1.6;list-style-type:none;padding-left:0;">
                <li><strong>Date:</strong> Today</li>
                <li><strong>Time:</strong> 5:00 PM onwards</li>
                <li><strong>Venue:</strong> Pivo Garten</li>
              </ul>

              <h3 style="color:#d4af37;letter-spacing:1px;margin-top:24px;text-transform:uppercase;font-size:14px;">Please Keep In Mind</h3>
              <ul style="font-size:15px;color:#ede6da;line-height:1.6;padding-left:20px;">
                <li style="margin-bottom:8px;">Be on time. Late entry will not be allowed.</li>
                <li style="margin-bottom:8px;">This is a 21+ event. Carry a valid ID (Aadhaar, Passport, or Driving Licence) — no exceptions.</li>
                <li style="margin-bottom:8px;">If your ID doesn't meet the age requirement, entry may be denied. We won't be responsible for this, so please double-check before you come.</li>
                <li style="margin-bottom:8px;">No drugs, no fights, no misbehaviour of any kind will be tolerated. Strict action will be taken against anyone found breaking this rule.</li>
              </ul>

              <p style="font-size:16px;color:#ede6da;line-height:1.5;margin-top:24px;">We can't wait to see you there for a great night!</p>

              <p style="font-size:15px;color:#9a948c;line-height:1.5;margin-top:24px;">
                Questions? Message us on WhatsApp: <br>
                +91 88888 22040 / +91 70204 95651
              </p>

              <p style="font-size:16px;color:#ede6da;line-height:1.5;margin-top:24px;">
                See you soon,<br>
                <strong>Team TheVMEx</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `
      });

      if (error) {
        console.error("Error sending chunk:", error);
      } else {
        console.log(`Successfully sent chunk. ID: ${data?.id}`);
      }
    } catch (e) {
      console.error("Exception sending chunk:", e);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
