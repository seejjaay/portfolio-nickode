import Link from "next/link";
import { MaskIcon } from "@/components/ui/MaskIcon";
import type { Project } from "@/content/projects";

/* Previous / next project (DESIGN.md 8.8, Figma 16:131). The list wraps round, so
   every project has both. */
export function ProjectNav({ prev, next }: { prev: Project; next: Project }) {
  const small = "flex items-center gap-[10px] font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted transition-colors duration-300 group-hover:text-text";
  const big = "mt-3 block font-display text-[clamp(32px,3.33vw,48px)] font-semibold uppercase leading-[1.1] tracking-[0.01em] text-text";
  return (
    <nav aria-label="More projects" className="mx-[var(--gutter)] flex flex-wrap items-end justify-between gap-8 border-t border-border pb-24 pt-12">
      <Link href={`/projects/${prev.slug}`} className="group">
        <span className={small}>
          <MaskIcon name="arrow-left" width={16} className="transition-transform duration-300 ease-brand group-hover:-translate-x-1 motion-reduce:transition-none" />
          PREVIOUS PROJECT
        </span>
        <span className={big}>{prev.title}</span>
      </Link>
      <Link href={`/projects/${next.slug}`} className="group text-right">
        <span className={`${small} justify-end`}>
          NEXT PROJECT
          <MaskIcon name="arrow-right" width={16} className="transition-transform duration-300 ease-brand group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
        <span className={big}>{next.title}</span>
      </Link>
    </nav>
  );
}
