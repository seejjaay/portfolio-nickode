import { AboutContent } from "@/components/about/AboutContent";
import { AboutScene } from "@/components/about/AboutScene";
import { AchievementsSection } from "@/components/achievements/AchievementsSection";
import { TitlesDivider } from "@/components/divider/TitlesDivider";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { Hero } from "@/components/hero/Hero";
import { StackSection } from "@/components/stack/StackSection";
import { WorkSection } from "@/components/work/WorkSection";

/* Step 1 placeholder: empty sections at Figma's 1440 heights so the nav anchors
   and scroll-spy can be exercised. Each is replaced in its own build step. */
const placeholders = {
  contact: { label: "Contact", height: 977, step: 11 },
} as const;

function Placeholder({ id }: { id: keyof typeof placeholders }) {
  const { label, height, step } = placeholders[id];
  return (
    <section id={id} style={{ height }} className="flex items-center justify-center">
      <p className="font-display text-[12px] uppercase tracking-[0.18em] text-text-muted">
        {label} · placeholder · step {step}
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <section id="about">
        <AboutScene>
          <AboutContent />
        </AboutScene>
      </section>
      <TitlesDivider />
      <WorkSection />
      <StackSection />
      <AchievementsSection />
      <ExperienceSection />
      <Placeholder id="contact" />
    </>
  );
}
