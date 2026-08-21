import { Resend } from 'resend';
import { getDb } from '../src/lib/db';
import { orders } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

const EXTRA_EMAILS = ['spahade824@gmail.com'];

async function main() {
  if (!process.env.RESEND_API_KEY) {
    console.error('No RESEND_API_KEY found in .env.local!');
    process.exit(1);
  }

  const db = getDb();
  const approvedOrders = await db
    .select({ email: orders.email })
    .from(orders)
    .where(eq(orders.status, 'approved'));

  const uniqueEmails = Array.from(
    new Set([
      ...approvedOrders.map((o) => o.email.toLowerCase().trim()),
      ...EXTRA_EMAILS.map((e) => e.toLowerCase().trim()),
    ])
  );

  console.log(`Found ${approvedOrders.length} approved orders.`);
  console.log(`Total unique recipients: ${uniqueEmails.length}`);

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'TheVMEx <onboarding@resend.dev>';
  const chunkSize = 40;

  for (let i = 0; i < uniqueEmails.length; i += chunkSize) {
    const chunk = uniqueEmails.slice(i, i + chunkSize);
    console.log(`Sending chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} emails)...`);

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: fromEmail,
        bcc: chunk,
        subject: 'Masquerade Night — Masks Available at Venue',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Masquerade Night — Masks Available at Venue</title>
</head>
<body style="margin:0;padding:0;background-color:#06050a;font-family:'Helvetica Neue',Arial,sans-serif;color:#ede6da;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#06050a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0f0c14;border:1px solid rgba(212,175,55,0.3);padding:32px;border-radius:4px;">
          <tr>
            <td>
              <p style="font-size:16px;color:#ede6da;line-height:1.6;">Hi,</p>
              <p style="font-size:16px;color:#ede6da;line-height:1.6;">We're so pleased you're joining us for <strong>Masquerade Night</strong>! Can't wait to celebrate with you tonight.</p>
              <p style="font-size:16px;color:#ede6da;line-height:1.6;">A quick note before you arrive — <strong>masks are compulsory for entry</strong>, masks will be available at the venue for a minimal cost.</p>
              <p style="font-size:16px;color:#ede6da;line-height:1.6;">Come early, grab your mask, and settle in — you won't want to miss a single moment with the artists.</p>
              <p style="font-size:16px;color:#d4af37;line-height:1.6;font-style:italic;">Put it on, step in, and let the night begin. See you at the party!</p>
              <p style="font-size:16px;color:#ede6da;line-height:1.6;margin-top:24px;">
                Warm regards,<br>
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
        `,
      });

      if (error) {
        console.error('Error sending chunk:', error);
      } else {
        console.log(`Chunk sent successfully. ID: ${data?.id}`);
      }
    } catch (e) {
      console.error('Exception sending chunk:', e);
    }
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(console.error);
