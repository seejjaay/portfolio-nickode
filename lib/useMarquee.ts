"use client";

import { useLayoutEffect, useRef, useState } from "react";

const MAX_REPEATS = 6; // safety cap on how many times the items repeat per group

/* Shared by every marquee row. The row renders two identical groups; this
   measures the first one so the loop runs at a constant speed in px/s
   (`duration`) and repeats the items (`repeats`) until one group is wider than
   the screen, which keeps the loop seamless on any viewport. */
export function useMarquee(speed: number) {
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

  return { groupRef, repeats, duration };
}
