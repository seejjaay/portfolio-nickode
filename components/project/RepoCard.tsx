import { MaskIcon } from "@/components/ui/MaskIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Project } from "@/content/projects";

/* GitHub repository (DESIGN.md 8.7, Figma 16:93): the repo path, a short
   description, stats and the primary button. Stars and forks are placeholders in
   the data; they can be fetched from the GitHub API at build time later. */
export function RepoCard({ repo }: { repo: Project["repo"] }) {
  const stat = "flex min-h-[25px] items-center gap-[8px] font-display text-[12px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-2";
  return (
    <div>
      <SectionHeader eyebrow="05 — SOURCE CODE" title="GITHUB REPOSITORY" />
      <div className="mt-12 px-[var(--gutter)]">
        <div className="flex flex-col gap-8 rounded-card border border-border bg-surface/60 p-[41px] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 max-w-[867px]">
            <p className="flex items-center gap-[14px] font-display text-[clamp(20px,5.5vw,28px)] font-medium leading-[1.2] text-text">
              <MaskIcon name="git-branch" width={22} className="shrink-0" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{repo.url}</span>
            </p>
            <p className="mt-4 font-body text-[17px] leading-[1.7] text-text-2">{repo.description}</p>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {repo.stars !== undefined && (
                <li className={stat}>
                  <MaskIcon name="star" width={16} />
                  {repo.stars} STARS
                </li>
              )}
              {repo.forks !== undefined && (
                <li className={stat}>
                  <MaskIcon name="git-fork" width={16} />
                  {repo.forks} FORKS
                </li>
              )}
              {repo.language && (
                <li className={stat}>
                  <span aria-hidden className="size-[10px] rounded-full bg-text" />
                  {repo.language}
                </li>
              )}
              {repo.license && (
                <li className={stat}>
                  <MaskIcon name="file" width={16} />
                  {repo.license} LICENSE
                </li>
              )}
            </ul>
          </div>
          <a
            href={`https://${repo.url}`}
            className="inline-flex h-[52px] shrink-0 items-center gap-[10px] self-start rounded-control bg-text px-8 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-inverse transition-[transform,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--text)_20%,transparent)] motion-reduce:transition-none md:self-center"
          >
            VIEW ON GITHUB
            <MaskIcon name="arrow-up-right" width={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
