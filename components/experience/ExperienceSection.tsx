import { SectionHeader } from "@/components/ui/SectionHeader";
import { roles } from "@/content/experience";
import { ExperienceList } from "./ExperienceList";
import { ExperienceScene } from "./ExperienceScene";

/* Where I've been so far (DESIGN.md 7.7, Figma nodes 3:29 and 50:59). The
   section opens as a mountain under the title; scrolling breaks the mountain
   apart and the header and accordion settle into place. */
export function ExperienceSection() {
  return (
    <section id="experience">
      <ExperienceScene>
        <div className="flex flex-col gap-16 py-[120px]">
          <div data-exp-reveal className="exp-reveal">
            <SectionHeader eyebrow="05 — EXPERIENCE" title="WHERE I'VE BEEN SO FAR" />
          </div>
          <div className="px-[var(--gutter)]">
            <ExperienceList roles={roles} />
          </div>
        </div>
      </ExperienceScene>
    </section>
  );
}
