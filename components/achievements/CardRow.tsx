"use client";

import type { CSSProperties } from "react";
import type { Achievement } from "@/content/achievements";
import { useMarquee } from "@/lib/useMarquee";
import { AchievementCard } from "./AchievementCard";

/* One infinite row of achievement cards (DESIGN.md 7.6), built on the same
   seamless two-group track as the titles divider. Hovering or focusing a row
   pauses it (see .achv-row in globals.css) so a card can be read and clicked. */
type Props = {
  items: readonly Achievement[];
  speed: number; // px per second
  phase: number; // 0-1 start offset, so the rows do not line up
  reverse?: boolean;
  decorative?: boolean;
  onOpen: (a: Achievement, trigger: HTMLElement) => void;
};

export function CardRow({ items, speed, phase, reverse = false, decorative = false, onOpen }: Props) {
  const { groupRef, repeats, duration } = useMarquee(speed);

  const groups = [0, 1].map((copy) => (
    <ul
      key={copy}
      ref={copy === 0 ? groupRef : undefined}
      aria-hidden={copy === 1 || decorative ? true : undefined}
      className="marquee-group flex shrink-0 items-start gap-5 pr-5"
    >
      {Array.from({ length: repeats }).flatMap((_, r) =>
        items.map((a) => (
          <li key={`${r}-${a.id}`} className="shrink-0">
            <AchievementCard a={a} onOpen={onOpen} passive={copy === 1} decorative={decorative} />
          </li>
        )),
      )}
    </ul>
  ));

  return (
    <div
      className="marquee-row achv-row"
      style={{ "--dur": `${duration}s`, "--phase": phase } as CSSProperties}
    >
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>{groups}</div>
    </div>
  );
}
