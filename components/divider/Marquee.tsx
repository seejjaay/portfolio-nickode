"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/* One infinite marquee row (DESIGN.md 7.3). The track holds two identical
   groups and slides by exactly one group's width, so the loop has no seam.
   The movement is a CSS animation (compositor only); this component just
   measures one group to get a constant speed in px/s and to repeat the items
   until a group is wider than the screen. It keeps moving on hover; reduced
   motion shows a static wrapped list. */
const MAX_REPEATS = 6; // safety cap on how many times the items repeat per group

type Props = {
  items: readonly string[];
  speed: number; // px per second
  phase: number; // 0-1: how far through the loop the row starts, so rows do not line up
  reverse?: boolean;
  outlined?: boolean;
};

export function Marquee({ items, speed, phase, reverse = false, outlined = false }: Props) {
  const groupRef = useRef<HTMLUListElement>(null);
  const [repeats, setRepeats] = useState(1);
  const [duration, setDuration] = useState(90);

  useLayoutEffect(() => {
    // Reduced motion shows one wrapped list, so there is nothing to measure.
    // (Measuring would also spin: a wrapped group is never wider than the screen.)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const group = groupRef.current!;
    const measure = () => {
      const unit = group.scrollWidth / repeats;
      if (!unit) return;
      const need = Math.min(MAX_REPEATS, Math.max(1, Math.ceil(window.innerWidth / unit)));
      if (need !== repeats) setRepeats(need);
      else setDuration(group.scrollWidth / speed);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(group);
    document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [repeats, speed]);

  const text = outlined
    ? "text-transparent opacity-85 [-webkit-text-stroke:var(--outline-stroke)_var(--text)]"
    : "text-text";

  const groups = [0, 1].map((copy) => (
    <ul
      key={copy}
      ref={copy === 0 ? groupRef : undefined}
      aria-hidden={copy === 1 ? true : undefined}
      className="marquee-group flex shrink-0 items-center gap-10 pr-10"
    >
      {Array.from({ length: repeats }).flatMap((_, r) =>
        items.map((item) => (
          <li key={`${r}-${item}`} className="flex shrink-0 items-center gap-10">
            <span
              className={`whitespace-nowrap font-display text-[44px] font-medium uppercase leading-[1.2] tracking-[0.03em] ${text}`}
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
