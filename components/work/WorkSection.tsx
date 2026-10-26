import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects } from "@/content/projects";
import { WorkScene } from "./WorkScene";

/* What I've done (DESIGN.md 7.4, Figma nodes 3:26 and 34:115): the section
   header, then a pinned scene where a laptop opens on scroll and its screen
   shows the project carousel. */
export function WorkSection() {
  return (
    <section id="work">
      <div className="pb-14 pt-[120px]">
        <SectionHeader eyebrow="02 — SELECTED WORK" title="WHAT I'VE DONE" />
      </div>
      <WorkScene projects={projects} />
    </section>
  );
}
