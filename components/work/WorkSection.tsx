import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects } from "@/content/projects";
import { ProjectList } from "./ProjectList";
import { WorkScene } from "./WorkScene";

/* What I've done (DESIGN.md 7.4, Figma nodes 3:26 and 34:115): the section
   header, then a pinned scene where a laptop opens on scroll and its screen
   shows the project carousel (900px and up) or a list of project cards (below). */
export function WorkSection() {
  return (
    <section id="work">
      <div className="pb-14 pt-[72px]">
        <SectionHeader eyebrow="03 — SELECTED WORK" title="WHAT I'VE DONE" />
      </div>
      {/* The pinned laptop needs room for the carousel text to read; narrower screens get a plain list. */}
      <div className="max-[899px]:hidden">
        <WorkScene projects={projects} />
      </div>
      <div className="min-[900px]:hidden">
        <ProjectList projects={projects} />
      </div>
    </section>
  );
}
