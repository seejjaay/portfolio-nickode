import { AboutContent } from "@/components/about/AboutContent";
import { AboutScene } from "@/components/about/AboutScene";
import { AchievementsSection } from "@/components/achievements/AchievementsSection";
import { TitlesDivider } from "@/components/divider/TitlesDivider";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { Hero } from "@/components/hero/Hero";
import { ServicesSection } from "@/components/services/ServicesSection";
import { StackSection } from "@/components/stack/StackSection";
import { WorkSection } from "@/components/work/WorkSection";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="about" className="about-section">
        <AboutScene>
          <AboutContent />
        </AboutScene>
      </section>
      <TitlesDivider />
      <ServicesSection />
      <WorkSection />
      <StackSection />
      <AchievementsSection />
      <ExperienceSection />
      <ContactSection />
    </>
  );
}
