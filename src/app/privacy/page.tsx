import { EVENT, BRAND, CONTACT } from "@/lib/config";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0d] text-text-primary pt-24 pb-20">
      <div className="w-full max-w-[800px] mx-auto px-6 sm:px-8">
        <h1 className="font-display text-[2.5rem] font-bold text-gold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 font-body text-[0.9rem] text-text-muted leading-[1.7]">
          
          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">1. Information We Collect</h2>
            <p>
              When you purchase a ticket for {EVENT.name}, {BRAND.legalName} ("{BRAND.name}") collects the following information:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Full Name</li>
              <li>Phone Number</li>
              <li>Email Address</li>
              <li>College or Institution Name</li>
              <li>Year of Study</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p>
              We use the collected information solely for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>To verify your payment and issue your digital ticket.</li>
              <li>To communicate important updates regarding the event (e.g., venue details, timing changes).</li>
              <li>To verify your identity at the entry gate against a government-issued ID.</li>
              <li>To ensure the safety and security of all attendees.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">3. Data Sharing & Security</h2>
            <p>
              Your personal information is kept strictly confidential. We do not sell, rent, or share your data with any third-party marketing agencies. Payment processing is handled securely via Cashfree/UPI, and we do not store your banking credentials or PINs.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">4. Data Retention</h2>
            <p>
              We retain your data only for as long as necessary to fulfill the purposes outlined in this policy and to comply with legal obligations. After the event concludes, attendee lists will be securely archived or deleted.
            </p>
          </section>

          <section>
            <h2 className="text-[1.2rem] font-semibold text-text-primary mb-3">5. Contact Us</h2>
            <p>
              If you have any questions about how your data is handled, please contact us at:
              <br />
              <strong>Email:</strong> {CONTACT.email}
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
