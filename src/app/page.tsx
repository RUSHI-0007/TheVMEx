import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import GoldDivider from "@/components/GoldDivider";
import LineupSection from "@/components/LineupSection";
import EventDetailsSection from "@/components/EventDetailsSection";
import TicketBookingSection from "@/components/TicketBookingSection";
import GallerySection from "@/components/GallerySection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <GoldDivider />
      <LineupSection />
      <GoldDivider />
      <EventDetailsSection />
      <GoldDivider />
      <TicketBookingSection />
      <GoldDivider />
      <GallerySection />
      <GoldDivider />
      <ContactSection />
      <FooterSection />
    </main>
  );
}
