import { EVENT, BRAND, CONTACT } from "@/lib/config";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-text-primary pt-24 pb-20">
      <div className="w-full max-w-[800px] mx-auto px-6 sm:px-8">
        <h1 className="font-display text-[2.5rem] font-bold text-gold mb-8">Terms & Conditions</h1>
        
        <div className="space-y-8 font-body text-[0.9rem] text-text-muted leading-[1.7]">
          
          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">1. General</h2>
            <p>
              These Terms & Conditions govern the purchase of tickets and attendance at {EVENT.name}, operated by {BRAND.legalName} ("{BRAND.name}"). By purchasing a ticket, you agree to abide by these terms.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">2. Ticket Purchase & Verification</h2>
            <p>
              All ticket purchases are subject to manual verification. After completing your UPI payment and uploading the UTR/screenshot, your ticket will be in a "Pending" state until verified by our team. {BRAND.name} reserves the right to reject any payment that is invalid or cannot be verified.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">3. Refund & Cancellation Policy</h2>
            <p>
              <strong>Tickets are strictly non-refundable.</strong> Once a ticket is purchased and verified, no refunds will be issued under any circumstances, including failure to attend.
            </p>
            <p className="mt-2">
              <strong>Exceptions:</strong> In the highly unlikely event that {EVENT.name} is cancelled by the organizers, a full refund will be initiated to the original payment source within 7-10 working days.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">4. Age Restriction (21+)</h2>
            <p>
              This is a strictly 21+ event. All attendees must present a valid, government-issued physical ID (Aadhaar, Passport, Driving License) at the entry gate. Failure to prove age will result in immediate denial of entry without refund.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">5. Entry Rules & Code of Conduct</h2>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Right of admission is reserved by {BRAND.name} and the venue management.</li>
              <li>Outside food, beverages, and illegal substances are strictly prohibited.</li>
              <li>A formal or semi-formal dress code must be strictly adhered to. Masks are highly encouraged.</li>
              <li>Any misbehavior, violence, or damage to property will lead to immediate eviction from the venue and potential legal action.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">6. Liability</h2>
            <p>
              {BRAND.legalName} and the venue hold no liability for any loss, theft, or damage to personal belongings during the event.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">7. Contact Information</h2>
            <p>
              For any queries regarding these terms or your ticket, please contact us at:
              <br />
              <strong>Email:</strong> {CONTACT.email}
              <br />
              <strong>Phone:</strong> {CONTACT.phone}
            </p>
          </section>
          
        </div>
        
        <div className="mt-12 pt-8 border-t border-gold/[0.1]">
          <a href="/" className="font-body text-gold hover:text-gold-muted transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}
