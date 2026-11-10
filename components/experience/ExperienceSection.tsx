import { SectionHeader } from "@/components/ui/SectionHeader";
import { SwarmBuild } from "@/components/swarm/SwarmBuild";
import { roles } from "@/content/experience";
import { ExperienceList } from "./ExperienceList";

/* Where I've been so far (DESIGN.md 7.7). A swarm of colored cursors builds the
   header and each role row as they scroll into view (lib/swarm.ts). */
export function ExperienceSection() {
  return (
    <SwarmBuild id="experience">
      <div className="flex flex-col gap-16 pb-[72px] pt-[120px]">
        <div data-swarm-target>
          <SectionHeader eyebrow="07 — EXPERIENCE" title="WHERE I'VE BEEN SO FAR" />
        </div>
        <div className="px-[var(--gutter)]">
          <ExperienceList roles={roles} />
        </div>
      </div>
    </SwarmBuild>
  );
}
