import { SectionHeader } from "@/components/ui/SectionHeader";
import { AchievementRows } from "./AchievementRows";

/* What I have achieved (DESIGN.md 7.6, Figma node 3:28): section header, then
   two infinite card rows (top scrolls left, bottom scrolls right) and a faint
   blurred third row. Cards open the certificate or event modal. */
export function AchievementsSection() {
  return (
    <section id="achievements" className="relative flex flex-col gap-14 py-[120px]">
      <SectionHeader eyebrow="04 — ACHIEVEMENTS" title="WHAT I HAVE ACHIEVED" />
      <AchievementRows />
    </section>
  );
}
