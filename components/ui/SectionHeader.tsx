/* Section header (DESIGN.md 5.3): numbered eyebrow, big Oswald title and a 1px
   divider, left-aligned on the content column. */
export function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="flex flex-col gap-4 px-[var(--gutter)]">
      <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
        {eyebrow}
      </p>
      <h2 className="font-display text-[clamp(36px,5vw,64px)] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text">
        {title}
      </h2>
      <div aria-hidden className="h-px w-full bg-border" />
    </header>
  );
}
