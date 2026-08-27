import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GoldDivider from "@/components/GoldDivider";
import EventsArchiveSection from "@/components/EventsArchiveSection";
import LineupSection from "@/components/LineupSection";
import GallerySection from "@/components/GallerySection";
import BookingSection from "@/components/BookingSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
// EventDetailsSection and TicketBookingSection are preserved but not rendered
// (event is over). They can be restored for future event pages.

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <GoldDivider />
      <EventsArchiveSection />
      <GoldDivider />
      <LineupSection />
      <GoldDivider />
      <GallerySection />
      <GoldDivider />
      <BookingSection />
      <GoldDivider />
      <ContactSection />
      <FooterSection />
    </main>
  );
}

