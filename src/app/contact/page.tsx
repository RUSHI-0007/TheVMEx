import { SectionHeading } from "@/components/ui/SectionHeading";
import { BRAND, CONTACT } from "@/lib/config";

export const metadata = {
  title: `Contact Us | ${BRAND.name}`,
  description: "Get in touch with us for any queries.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#06050a] pt-32 pb-24">
      <div className="w-full max-w-[800px] mx-auto px-6 sm:px-8">
        <SectionHeading
          label="Get in Touch"
          title="Contact Us"
          subtitle="We're here to help with any questions you have about the event."
          align="left"
        />

        <div className="mt-12 space-y-8 font-body text-[0.95rem] text-text-muted leading-relaxed">
          <p>
            If you have any questions, concerns, or need assistance regarding your ticket booking, please don't hesitate to contact us.
          </p>

          <div className="bg-[#131115] p-8 border border-gold/10 rounded-sm shadow-sm">
            <h3 className="font-display text-xl text-gold mb-6">Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-bold text-text-primary uppercase tracking-widest text-xs mb-1">Email</p>
                <a href={`mailto:${CONTACT.email}`} className="text-gold-dim hover:text-gold transition-colors">
                  {CONTACT.email}
                </a>
              </div>
              
              <div>
                <p className="font-bold text-text-primary uppercase tracking-widest text-xs mb-1">Phone / WhatsApp</p>
                <a href={`tel:${CONTACT.phone}`} className="text-gold-dim hover:text-gold transition-colors">
                  {CONTACT.phone}
                </a>
              </div>
              
              <div>
                <p className="font-bold text-text-primary uppercase tracking-widest text-xs mb-1">Operating Address</p>
                <p className="text-text-muted">
                  {BRAND.legalName}<br />
                  Pune, Maharashtra, India
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm opacity-80 pt-4">
            Our support team is available during regular business hours and we aim to respond to all inquiries within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
