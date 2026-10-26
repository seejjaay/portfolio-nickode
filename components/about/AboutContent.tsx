import type { CSSProperties } from "react";
import { about } from "@/content/about";
import { DotPortrait } from "./DotPortrait";

/* About content (DESIGN.md 7.2, Figma node 3:25): dot-matrix portrait left,
   copy and info panel right, giant outlined 01 far right. Every revealed
   element fades up (700ms, 80ms stagger) when the wave scene opens; `--i` is
   its place in that order (see .about-reveal in globals.css). */
const reveal = (i: number) =>
  ({ className: "about-reveal", style: { "--i": i } as CSSProperties });

export function AboutContent() {
  return (
    <div className="relative w-full px-[var(--gutter)] py-[120px]">
      <div className="flex items-center gap-20">
        <div
          {...reveal(0)}
          className={`${reveal(0).className} relative h-[560px] w-[440px] shrink-0 overflow-hidden rounded-card border border-border bg-bg-raised`}
        >
          <DotPortrait />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-6">
          <p
            {...reveal(1)}
            className={`${reveal(1).className} font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted`}
          >
            {about.eyebrow}
          </p>
          <div {...reveal(2)} className={`${reveal(2).className} flex flex-col gap-[14px]`}>
            <h2 className="font-display text-[64px] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text">
              {about.title}
            </h2>
            <span aria-hidden className="block h-[2px] w-8 bg-text" />
          </div>
          <p
            {...reveal(3)}
            className={`${reveal(3).className} text-[20px] leading-[1.7] text-text-2`}
          >
            {about.intro}
          </p>
          <dl
            {...reveal(4)}
            className={`${reveal(4).className} grid w-full grid-cols-2 gap-x-12 gap-y-4 whitespace-nowrap rounded-control border border-border-strong p-7`}
          >
            {about.info.map(({ key, value }) => (
              <div key={key} className="flex items-center gap-3">
                <dt className="font-display text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-text">
                  {key}:
                </dt>
                <dd className="text-[17px] leading-[1.7] text-text-2">{value}</dd>
              </div>
            ))}
          </dl>
          {/* The wrapper takes the reveal so the button keeps its own hover transform. */}
          <div {...reveal(5)}>
            <a
              href={about.cv.href}
              className="inline-flex items-center gap-[10px] rounded-control bg-text px-8 py-4 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-inverse transition-[transform,box-shadow] duration-300 ease-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--text)_20%,transparent)] motion-reduce:transition-none"
            >
              {about.cv.label}
              <span aria-hidden className="icon-download" />
            </a>
          </div>
        </div>
      </div>

      <span
        aria-hidden
        {...reveal(6)}
        className={`${reveal(6).className} pointer-events-none absolute right-6 top-[80px] font-display text-[180px] font-semibold uppercase leading-[0.95] text-transparent [-webkit-text-stroke:2px_color-mix(in_srgb,var(--text)_14%,transparent)]`}
      >
        {about.number}
      </span>
    </div>
  );
}
