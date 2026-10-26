import Link from "next/link";
import { MaskIcon } from "@/components/ui/MaskIcon";
import type { Project } from "@/content/projects";

/* Project Detail header (DESIGN.md 8.1, Figma 15:20): back link, eyebrow, giant
   title, one-line summary, the four-up meta row and the two buttons. */
const label = "font-display text-[11px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted";

export function ProjectHeader({ project }: { project: Project }) {
  const { meta } = project;
  return (
    <header className="px-[var(--gutter)] pt-14">
      <Link
        href="/#work"
        className="group flex w-fit items-center gap-[10px] font-display text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text"
      >
        <MaskIcon name="arrow-left" width={16} className="transition-transform duration-300 ease-brand group-hover:-translate-x-1 motion-reduce:transition-none" />
        BACK TO PROJECTS
      </Link>

      <p className="mt-7 font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
        {project.featured ? "FEATURED · " : ""}
        {project.category}
      </p>
      <h1 className="mt-7 font-display text-[clamp(56px,8.33vw,120px)] font-semibold uppercase leading-[1.1] tracking-[0.01em] text-text">
        {project.title}
      </h1>
      <p className="mt-7 max-w-[760px] font-body text-[20px] leading-[1.7] text-text-2">{project.summary}</p>

      <dl className="mt-[2px] flex flex-wrap gap-x-[72px] gap-y-4">
        {[
          ["ROLE", meta.role],
          ["YEAR", meta.year],
          ["TIMELINE", meta.timeline],
          ["TEAM", meta.team],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className={label}>{k}</dt>
            <dd className="mt-[6px] font-display text-[20px] font-medium leading-[1.2] text-text">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-start gap-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            className="inline-flex h-[52px] items-center gap-[10px] rounded-control bg-text px-8 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-inverse transition-[transform,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--text)_20%,transparent)] motion-reduce:transition-none"
          >
            VIEW LIVE SITE
            <MaskIcon name="arrow-up-right" width={16} />
          </a>
        )}
        <a
          href={`https://${project.repo.url}`}
          className="inline-flex h-[54px] items-center gap-[10px] rounded-control border border-border-strong px-8 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text transition-colors duration-300 hover:border-text"
        >
          <MaskIcon name="git-branch" width={16} />
          GITHUB REPO
        </a>
      </div>
    </header>
  );
}
