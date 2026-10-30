"use client";

import type { Project } from "@/content/projects";
import { ProjectCard } from "./ProjectCard";

/* Phone version of the carousel (DESIGN.md 12.1): once the laptop lid is up, each
   project card rises out of the screen at full width, one at a time as you scroll.
   WorkScene positions the cards every frame (transform and opacity only); this just
   renders them stacked on one spot, with a counter and prev/next above. Hidden at
   900px and up, where the carousel sits on the laptop screen itself. */
type Props = {
  projects: readonly Project[];
  active: number;
  onGo: (index: number) => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function PopOutCards({ projects, active, onGo }: Props) {
  const last = projects.length - 1;
  return (
    <div className="lp-pop" role="region" aria-roledescription="carousel" aria-label="Selected projects">
      <div className="lp-pop-bar">
        <button type="button" aria-label="Previous project" disabled={active === 0} onClick={() => onGo(active - 1)}>
          ←
        </button>
        <p aria-live="polite">
          {pad(active + 1)} / {pad(projects.length)}
        </p>
        <button type="button" aria-label="Next project" disabled={active === last} onClick={() => onGo(active + 1)}>
          →
        </button>
      </div>
      <ul className="lp-pop-stack">
        {projects.map((p, i) => (
          <li key={p.slug} data-pop aria-roledescription="slide" aria-label={`${i + 1} of ${projects.length}: ${p.title}`}>
            <ProjectCard project={p} className="h-full" tabIndex={i === active ? 0 : -1} />
          </li>
        ))}
      </ul>
    </div>
  );
}
