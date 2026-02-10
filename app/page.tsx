import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { TrustSection } from "@/components/trust-section";
import { ProblemSection } from "@/components/problem-section";
import { ApproachSection } from "@/components/approach-section";
import { MentorSection } from "@/components/mentor-section";
import { NotForSection } from "@/components/not-for-section";
import { MethodSection } from "@/components/method-section";
import { PricingSection } from "@/components/pricing-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FaqSection } from "@/components/faq-section";
import { CtaBanner } from "@/components/cta-banner";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustSection />
        <ProblemSection />
        <ApproachSection />
        <MentorSection />
        <NotForSection />
        <MethodSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaBanner />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
