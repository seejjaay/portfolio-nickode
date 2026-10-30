"use client";

import { useRef, useState } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { achievementRows, type Achievement } from "@/content/achievements";
import { AchievementListModal } from "./AchievementListModal";
import { AchievementModal } from "./AchievementModal";
import { CardRow } from "./CardRow";

/* The 500px dual-row marquee (Figma 8:6) plus the faint third row for depth,
   edge fades, the SEE MORE button (bottom right of the section) with its list
   modal, and the detail modal the cards and list rows open. Rows sit at
   y = 0 / 196 / 392. */
export function AchievementRows() {
  const [active, setActive] = useState<Achievement | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null); // what opened the detail modal
  const moreButton = useRef<HTMLButtonElement>(null);

  const open = (a: Achievement, el: HTMLElement) => {
    trigger.current = el;
    setActive(a);
  };

  return (
    <>
      <div className="achv-rows relative h-[500px] overflow-hidden max-md:h-[440px]">
        <div className="marquee-slot absolute inset-x-0 top-0">
          <CardRow items={achievementRows[0]} speed={68} phase={0.03} onOpen={open} />
        </div>
        <div className="marquee-slot absolute inset-x-0 top-[196px] max-md:top-[168px]">
          <CardRow items={achievementRows[1]} speed={54} phase={0.5} reverse onOpen={open} />
        </div>
        <div className="marquee-slot achv-depth pointer-events-none absolute inset-x-0 top-[392px] opacity-[0.22] blur-[2.5px] max-md:top-[336px]">
          <CardRow items={achievementRows[2]} speed={42} phase={0.25} decorative onOpen={open} />
        </div>
        <div
          aria-hidden
          className="achv-fade pointer-events-none absolute left-0 top-0 h-[500px] w-[220px] bg-linear-to-r from-bg to-transparent max-md:w-[56px]"
        />
        <div
          aria-hidden
          className="achv-fade pointer-events-none absolute right-0 top-0 h-[500px] w-[220px] bg-linear-to-r from-transparent to-bg max-md:w-[56px]"
        />
      </div>

      <button
        ref={moreButton}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setListOpen(true)}
        className="achv-more group absolute bottom-9 right-[var(--gutter)] inline-flex cursor-pointer items-center max-md:left-[var(--gutter)] max-md:min-h-11 max-md:justify-center gap-[10px] rounded-control border border-border-strong px-6 py-[14px] font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text transition-colors duration-300 hover:border-text hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]"
      >
        See more
        <MaskIcon
          name="arrow-right"
          width={16}
          className="transition-transform duration-300 ease-brand group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </button>

      <AchievementListModal
        open={listOpen}
        triggerRef={moreButton}
        onClose={() => setListOpen(false)}
        onSelect={open}
      />
      <AchievementModal achievement={active} triggerRef={trigger} onClose={() => setActive(null)} />
    </>
  );
}
