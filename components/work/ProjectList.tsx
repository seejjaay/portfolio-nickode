import type { Project } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";

/* What I've done without the laptop scene: a plain stack of project cards, each
   linking to its page. Shown on narrow screens under reduced motion; everywhere
   else the pinned laptop scene runs (phones get the pop-out cards). */
export function ProjectList({ projects }: { projects: readonly Project[] }) {
  return (
    <ul className="flex flex-col gap-4 px-[var(--gutter)] pb-24">
      {projects.map((p) => (
        <li key={p.slug}>
          <ProjectCard project={p} />
        </li>
      ))}
    </ul>
  );
}
