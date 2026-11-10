/* Section header (DESIGN.md 5.3): numbered eyebrow, big Oswald title and a 1px
   divider, left-aligned on the content column. With `reveal` (inner pages only,
   where <Reveal /> is mounted) the eyebrow and title rise in and the divider
   draws across (DESIGN.md 9.1). */
export function SectionHeader({ eyebrow, title, reveal = false }: { eyebrow: string; title: string; reveal?: boolean }) {
  const r = (kind: string | true, i: number) =>
    reveal ? ({ "data-reveal": kind === true ? "" : kind, style: { "--i": i } } as Record<string, unknown>) : {};
  return (
    <header className="flex flex-col gap-4 px-[var(--gutter)]">
      <p
        className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted"
        {...r(true, 0)}
      >
        {eyebrow}
      </p>
      <h2
        className="font-display text-[clamp(36px,5vw,64px)] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text"
        {...r(true, 1)}
      >
        {title}
      </h2>
      <div aria-hidden className="h-px w-full bg-border" {...r("grow-x", 2)} />
    </header>
  );
}
