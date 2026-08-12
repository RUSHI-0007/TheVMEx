import { SectionHeading } from "@/components/ui/SectionHeading";
import { BRAND, CONTACT } from "@/lib/config";

export const metadata = {
  title: `Refunds & Cancellations | ${BRAND.name}`,
  description: "Refund and cancellation policy.",
};

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-[#06050a] pt-32 pb-24">
      <div className="w-full max-w-[800px] mx-auto px-6 sm:px-8">
        <SectionHeading
          label="Policies"
          title="Refunds & Cancellations"
          subtitle="Please read our refund and cancellation policy carefully."
          align="left"
        />

        <div className="mt-12 space-y-8 font-body text-[0.95rem] text-text-muted leading-relaxed">
          <div className="bg-[#131115] p-8 border border-gold/10 rounded-sm">
            <h3 className="font-display text-xl text-gold mb-4">No Refunds Policy</h3>
            <p className="mb-4">
              All ticket sales are final. We do not offer refunds or exchanges for any tickets purchased for {BRAND.name}, unless the event is cancelled by the organizers.
            </p>
            <p>
              This is a standard policy for live events and entertainment. Once a ticket is purchased, your spot is reserved and cannot be un-reserved.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-text-primary mb-2">Event Cancellation</h4>
              <p>
                In the rare event that {BRAND.name} is cancelled entirely, you will receive a full refund of the ticket price automatically to your original method of payment.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-text-primary mb-2">Event Rescheduling</h4>
              <p>
                If the event is rescheduled, your ticket will remain valid for the new date. If you are unable to attend the rescheduled date, you may request a refund within 7 days of the rescheduling announcement.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-text-primary mb-2">Transferability</h4>
              <p>
                Tickets are strictly non-transferable. The name on the ticket must match the government-issued photo ID presented at the entry gate.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-text-primary mb-2">Contact</h4>
              <p>
                For any exceptional circumstances or queries regarding this policy, please contact us at <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">{CONTACT.email}</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
