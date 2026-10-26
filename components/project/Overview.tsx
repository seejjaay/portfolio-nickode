import type { Project } from "@/content/projects";

/* Overview (DESIGN.md 8.3, Figma 15:71): two paragraphs left, a bordered facts
   table right. Same header look as SectionHeader but without the divider. */
export function Overview({ project }: { project: Project }) {
  const { meta } = project;
  const facts = [
    ["ROLE", meta.role],
    ["CLIENT", meta.client ?? "Personal"],
    ["YEAR", meta.year],
    ["DURATION", meta.timeline],
    ["STATUS", meta.status],
  ];
  return (
    <div className="grid gap-12 px-[var(--gutter)] lg:grid-cols-[minmax(0,704px)_400px] lg:justify-between">
      <div>
        <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">01 — OVERVIEW</p>
        <h2 className="mt-6 font-display text-[clamp(36px,5vw,64px)] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text">
          ABOUT THE PROJECT
        </h2>
        <div className="mt-6 flex flex-col gap-6 font-body text-[20px] leading-[1.7] text-text-2">
          {project.overview.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
      <dl className="h-fit rounded-[4px] border border-border-strong bg-surface/40 px-[29px] py-7 backdrop-blur-sm">
        {facts.map(([k, v], i) => (
          <div key={k} className={`flex h-[62px] items-center justify-between last:h-[61px] ${i ? "border-t border-border" : ""}`}>
            <dt className="font-display text-[11px] font-normal uppercase tracking-[0.18em] text-text-muted">{k}</dt>
            <dd className="font-body text-[18px] text-text">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
