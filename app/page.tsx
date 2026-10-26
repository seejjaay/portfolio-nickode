import { AboutContent } from "@/components/about/AboutContent";
import { AboutScene } from "@/components/about/AboutScene";
import { Hero } from "@/components/hero/Hero";

/* Step 1 placeholder: empty sections at Figma's 1440 heights so the nav anchors
   and scroll-spy can be exercised. Each is replaced in its own build step. */
const sections = [
  { id: "divider", label: "Titles divider", height: 222, step: 5 },
  { id: "work", label: "What I've done", height: 1177, step: 8 },
  { id: "stack", label: "What I use", height: 1177, step: 9 },
  { id: "achievements", label: "What I have achieved", height: 917, step: 6 },
  { id: "experience", label: "Where I've been so far", height: 1231, step: 7 },
  { id: "contact", label: "Contact", height: 977, step: 11 },
] as const;

export default function Home() {
  return (
    <>
      <Hero />
      <section id="about">
        <AboutScene>
          <AboutContent />
        </AboutScene>
      </section>
      {sections.map(({ id, label, height, step }) => (
        <section
          key={id}
          id={id}
          style={{ height }}
          className="flex items-center justify-center"
        >
          <p className="font-display text-[12px] uppercase tracking-[0.18em] text-text-muted">
            {label} · placeholder · step {step}
          </p>
        </section>
      ))}
    </>
  );
}
