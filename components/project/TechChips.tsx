import { SectionHeader } from "@/components/ui/SectionHeader";

/* Built with (DESIGN.md 8.6, Figma 16:71): a row of tag chips. */
export function TechChips({ tech }: { tech: string[] }) {
  return (
    <div>
      <SectionHeader reveal eyebrow="04 — TECH USED" title="BUILT WITH" />
      <ul className="mt-12 flex flex-wrap gap-3 px-[var(--gutter)]">
        {tech.map((t, i) => (
          <li key={t} data-reveal="" style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="flex h-11 items-center rounded-control border border-border-strong px-5 font-display text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-2">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
