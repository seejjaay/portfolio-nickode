import Link from "next/link";
import type { Project } from "@/content/projects";

/* One project card (the carousel's look, for narrow screens): cover with rings,
   index, category, title and a VIEW PROJECT link. Used by the plain list (reduced
   motion) and by the pop-out stack that rises from the laptop screen on phones. */
const RINGS = [120, 200, 280];
const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectCard({
  project: p,
  className = "h-[280px]",
  tabIndex,
}: {
  project: Project;
  className?: string;
  tabIndex?: number;
}) {
  return (
    <Link
      href={`/projects/${p.slug}`}
      prefetch={false}
      tabIndex={tabIndex}
      className={`group relative block overflow-hidden rounded-card border border-border transition-colors duration-300 hover:border-border-strong ${className}`}
      style={{ background: "linear-gradient(135deg, var(--media-from), var(--media-to))" }}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {RINGS.map((d) => (
          <span
            key={d}
            className="absolute right-[-10%] top-[34%] rounded-full border border-border"
            style={{ width: d, height: d, translate: "0 -50%" }}
          />
        ))}
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[color-mix(in_srgb,var(--bg)_85%,transparent)] to-transparent" />
      <span className="absolute left-5 top-5 font-display text-[14px] font-medium leading-none tracking-[0.12em] text-text-2">{pad(p.index)}</span>
      <span className="absolute left-5 bottom-[72px] font-display text-[11px] uppercase leading-none tracking-[0.18em] text-text-muted">
        {p.featured ? "FEATURED" : p.category}
      </span>
      <span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
        <span className="font-display text-[28px] font-semibold leading-[1.1] text-text">{p.title}</span>
        <span className="shrink-0 pb-1 font-display text-[11px] uppercase leading-none tracking-[0.18em] text-text-2 transition-transform duration-300 ease-brand group-hover:translate-x-1">
          VIEW PROJECT →
        </span>
      </span>
    </Link>
  );
}
