"use client";

import type { CSSProperties } from "react";
import { useMarquee } from "@/lib/useMarquee";

/* One infinite text marquee row (DESIGN.md 7.3). The track holds two identical
   groups and slides by exactly one group's width, so the loop has no seam. The
   movement is a CSS animation (compositor only); useMarquee measures the group
   for a constant speed. It keeps moving on hover; reduced motion shows a static
   wrapped list. */
type Props = {
  items: readonly string[];
  speed: number; // px per second
  phase: number; // 0-1: how far through the loop the row starts, so rows do not line up
  reverse?: boolean;
  outlined?: boolean;
};

export function Marquee({ items, speed, phase, reverse = false, outlined = false }: Props) {
  const { groupRef, repeats, duration } = useMarquee(speed);

  const text = outlined
    ? "text-transparent opacity-85 [-webkit-text-stroke:var(--outline-stroke)_var(--text)]"
    : "text-text";

  const groups = [0, 1].map((copy) => (
    <ul
      key={copy}
      ref={copy === 0 ? groupRef : undefined}
      aria-hidden={copy === 1 ? true : undefined}
      className="marquee-group flex shrink-0 items-center gap-10 pr-10 max-md:gap-6 max-md:pr-6"
    >
      {Array.from({ length: repeats }).flatMap((_, r) =>
        items.map((item) => (
          <li key={`${r}-${item}`} className="flex shrink-0 items-center gap-10 max-md:gap-6">
            <span
              className={`whitespace-nowrap font-display text-[44px] font-medium uppercase leading-[1.2] tracking-[0.03em] max-md:text-[28px] ${text}`}
            >
              {item}
            </span>
            <span aria-hidden className="icon-separator" />
          </li>
        )),
      )}
    </ul>
  ));

  return (
    <div
      className="marquee-row"
      style={{ "--dur": `${duration}s`, "--phase": phase } as CSSProperties}
    >
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>{groups}</div>
    </div>
  );
}
