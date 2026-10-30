import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects } from "@/content/projects";
import { ProjectList } from "./ProjectList";
import { WorkScene } from "./WorkScene";

/* What I've done (DESIGN.md 7.4, Figma nodes 3:26 and 34:115): the section
   header, then a pinned scene where a laptop opens on scroll. On a wide screen the
   project carousel sits on the laptop's screen; on a phone the cards rise out of it
   instead. Under reduced motion on a narrow screen it is a plain list of cards. */
export function WorkSection() {
  return (
    <section id="work">
      <div className="pb-14 pt-[72px]">
        <SectionHeader eyebrow="03 — SELECTED WORK" title="WHAT I'VE DONE" />
      </div>
      <div className="work-scene-wrap">
        <WorkScene projects={projects} />
      </div>
      <div className="work-list-wrap">
        <ProjectList projects={projects} />
      </div>
    </section>
  );
}
