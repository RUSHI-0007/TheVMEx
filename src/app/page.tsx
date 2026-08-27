import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GoldDivider from "@/components/GoldDivider";
import EventsArchiveSection from "@/components/EventsArchiveSection";
import GallerySection from "@/components/GallerySection";
import BookingSection from "@/components/BookingSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
// LineupSection, EventDetailsSection, TicketBookingSection preserved but unmounted

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <GoldDivider />
      <EventsArchiveSection />
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
