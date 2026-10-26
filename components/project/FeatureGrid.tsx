import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Project } from "@/content/projects";

/* Key features (DESIGN.md 8.4, Figma 16:2): a 3-up grid of numbered cards that
   grow to fit their text (items-start, as in the design). */
export function FeatureGrid({ features }: { features: Project["features"] }) {
  return (
    <div>
      <SectionHeader eyebrow="02 — FEATURES" title="KEY FEATURES" />
      <ul className="mt-12 grid items-start gap-6 px-[var(--gutter)] md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <li key={f.title} className="rounded-card border border-border bg-surface/60 p-8 backdrop-blur-sm">
            <p className="font-display text-[40px] font-medium leading-none text-text-muted">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-[13px] font-display text-[24px] font-medium uppercase leading-[1.2] tracking-[0.02em] text-text">{f.title}</h3>
            <p className="mt-2 font-body text-[17px] leading-[1.7] text-text-2">{f.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
