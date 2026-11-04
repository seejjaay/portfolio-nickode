"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { achievementRows, achievements, type Achievement } from "@/content/achievements";
import { jumpScrollBy } from "@/lib/scroll";
import { clearVortex, puke, squish, suck } from "@/lib/vortex";
import { AchievementCard } from "./AchievementCard";
import { AchievementModal } from "./AchievementModal";
import { CardRow } from "./CardRow";

/* The achievements, in two layouts you switch between with the SEE ALL button
   that sits above them:
     - the 500px dual-row marquee (Figma 8:6) plus the faint third row for depth
       and the edge fades. Rows sit at y = 0 / 196 / 392.
     - a grid of every achievement, newest first.
   Switching is a suck-and-puke: the cards on screen spiral into the button, the
   other layout is swapped in, and the button spits its cards out into place
   (lib/vortex.ts). Both layouts stay mounted, so the marquee keeps its
   measurements; the one not showing is collapsed and hidden. Under reduced
   motion the swap is instant. The detail modal is opened by any card. */
export function AchievementRows() {
  const [active, setActive] = useState<Achievement | null>(null);
  const [mode, setMode] = useState<"marquee" | "grid">("marquee");
  const trigger = useRef<HTMLElement | null>(null); // what opened the detail modal
  const moreButton = useRef<HTMLButtonElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const busy = useRef(false);

  const open = (a: Achievement, el: HTMLElement) => {
    trigger.current = el;
    setActive(a);
  };

  const toggle = async () => {
    if (busy.current) return;
    const to = mode === "marquee" ? "grid" : "marquee";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMode(to);
      return;
    }
    busy.current = true;
    const mouth = moreButton.current!;
    const marquee = marqueeRef.current!;
    const grid = gridRef.current!;
    const cardsOf = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>("li")];
    const leaving = to === "grid" ? marquee : grid;
    const arriving = to === "grid" ? grid : marquee;
    // Never wait on an animation for longer than it should take.
    const within = (task: Promise<void>, ms: number) =>
      Promise.race([task, new Promise<void>((r) => window.setTimeout(r, ms))]);

    try {
      clearVortex([...cardsOf(marquee), ...cardsOf(grid)]); // nothing left over from before
      // A data attribute, not a class: React rewrites `class` when it re-renders
      // at the swap below, and would silently drop it mid-animation.
      marquee.dataset.hold = ""; // the marquee holds still while it is swallowed or refilled
      squish(mouth, "gulp");
      await within(suck(cardsOf(leaving), mouth), 1400);

      // Swap the layouts. The button sits above both, so it should not move; if
      // anything above it did, the page follows so the button stays put.
      const before = mouth.getBoundingClientRect().top;
      flushSync(() => setMode(to));
      clearVortex(cardsOf(leaving));
      const shift = mouth.getBoundingClientRect().top - before;
      if (Math.abs(shift) > 1) jumpScrollBy(shift);

      squish(mouth, "burp");
      await within(puke(cardsOf(arriving), mouth, to === "grid" ? "sequence" : "distance"), 2200);
    } finally {
      // Whatever happened, every card ends in place and on show.
      clearVortex([...cardsOf(marquee), ...cardsOf(grid)]);
      delete marquee.dataset.hold;
      busy.current = false;
    }
  };

  const showing = mode === "marquee";
  const off = (isOff: boolean) => (isOff ? { inert: true, "aria-hidden": true } : {});

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="relative z-20 flex justify-center">
          <button
            ref={moreButton}
            type="button"
            aria-expanded={!showing}
            onClick={toggle}
            className="achv-more group inline-flex cursor-pointer items-center gap-[10px] rounded-control border border-border-strong px-7 py-[14px] font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text transition-colors duration-300 hover:border-text hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] max-md:min-h-11"
          >
            {showing ? "See all" : "Show less"}
            <MaskIcon name={showing ? "chevron-down" : "chevron-up"} width={16} />
          </button>
        </div>

        <div className="relative">
          <div ref={marqueeRef} className={`achv-layer ${showing ? "" : "is-off"}`} {...off(!showing)}>
            <div className="achv-rows relative -mt-2 h-[508px] max-md:h-[448px]">
              <div className="marquee-slot absolute inset-x-0 top-2">
                <CardRow items={achievementRows[0]} speed={68} phase={0.03} onOpen={open} />
              </div>
              <div className="marquee-slot absolute inset-x-0 top-[204px] max-md:top-[176px]">
                <CardRow items={achievementRows[1]} speed={54} phase={0.5} reverse onOpen={open} />
              </div>
              <div className="marquee-slot achv-depth pointer-events-none absolute inset-x-0 top-[400px] opacity-[0.22] blur-[2.5px] max-md:top-[344px]">
                <CardRow items={achievementRows[2]} speed={42} phase={0.25} decorative onOpen={open} />
              </div>
              <div
                aria-hidden
                className="achv-fade pointer-events-none absolute left-0 top-0 h-[508px] w-[220px] bg-linear-to-r from-bg to-transparent max-md:w-[56px]"
              />
              <div
                aria-hidden
                className="achv-fade pointer-events-none absolute right-0 top-0 h-[508px] w-[220px] bg-linear-to-r from-transparent to-bg max-md:w-[56px]"
              />
            </div>
          </div>

          <ul
            ref={gridRef}
            aria-label="All achievements"
            className={`achv-layer achv-grid grid grid-cols-3 gap-5 px-[var(--gutter)] max-lg:grid-cols-2 max-md:grid-cols-1 ${showing ? "is-off" : ""}`}
            {...off(showing)}
          >
            {achievements.map((a) => (
              <li key={a.id} className="min-w-0">
                <AchievementCard a={a} onOpen={open} fill />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AchievementModal achievement={active} triggerRef={trigger} onClose={() => setActive(null)} />
    </>
  );
}
