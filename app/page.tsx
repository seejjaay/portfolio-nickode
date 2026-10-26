import { AboutContent } from "@/components/about/AboutContent";
import { AboutScene } from "@/components/about/AboutScene";
import { AchievementsSection } from "@/components/achievements/AchievementsSection";
import { TitlesDivider } from "@/components/divider/TitlesDivider";
import { Hero } from "@/components/hero/Hero";

/* Step 1 placeholder: empty sections at Figma's 1440 heights so the nav anchors
   and scroll-spy can be exercised. Each is replaced in its own build step. */
const placeholders = {
  work: { label: "What I've done", height: 1177, step: 8 },
  stack: { label: "What I use", height: 1177, step: 9 },
  experience: { label: "Where I've been so far", height: 1231, step: 7 },
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
      <Placeholder id="work" />
      <Placeholder id="stack" />
      <AchievementsSection />
      <Placeholder id="experience" />
      <Placeholder id="contact" />
    </>
  );
}
