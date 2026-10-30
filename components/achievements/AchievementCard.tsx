"use client";

import Image from "next/image";
import type { Achievement } from "@/content/achievements";

/* One achievement card (Figma 17:3): glass surface, 80px thumbnail, meta line,
   title and a VIEW DETAILS cue. A button that opens the matching modal.
   `passive` cards are the marquee's duplicate copy: still clickable (they scroll
   past under the pointer) but out of the tab order and hidden from screen
   readers. `decorative` cards (the faint depth row) are not interactive at all. */
type Props = {
  a: Achievement;
  onOpen: (a: Achievement, trigger: HTMLElement) => void;
  passive?: boolean;
  decorative?: boolean;
};

const card =
  "flex shrink-0 items-center gap-5 rounded-marquee border border-border bg-[color-mix(in_srgb,var(--text)_6%,transparent)] py-6 pl-6 pr-8 text-left backdrop-blur-[6px] max-md:gap-3 max-md:py-4 max-md:pl-4 max-md:pr-5";
const interactive =
  "cursor-pointer transition-[transform,background-color,border-color] duration-[400ms] ease-brand hover:-translate-y-1 hover:border-border-strong hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] motion-reduce:transition-none";

function Body({ a }: { a: Achievement }) {
  return (
    <>
      {a.thumb ? (
        <Image
          src={a.thumb}
          alt=""
          width={80}
          height={80}
          unoptimized
          className="size-20 shrink-0 rounded-card border border-border object-cover max-md:size-14"
        />
      ) : (
        <span
          aria-hidden
          className="size-20 shrink-0 rounded-card border border-border [background:linear-gradient(to_bottom,var(--thumb-from),var(--thumb-to))] max-md:size-14"
        />
      )}
      <span className="flex w-[260px] flex-col items-start gap-2 max-md:w-[156px] max-md:gap-1">
        <span className="block whitespace-pre-wrap font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
          {`${a.kind.toUpperCase()}  ·  ${a.issuer.toUpperCase()}  ·  ${a.year}`}
        </span>
        <span className="block font-display text-[19px] font-medium leading-[1.2] tracking-[0.03em] text-text max-md:text-[16px]">
          {a.title}
        </span>
        <span className="block whitespace-pre font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-2">
          VIEW DETAILS<span aria-hidden>{"  →"}</span>
        </span>
      </span>
    </>
  );
}

export function AchievementCard({ a, onOpen, passive = false, decorative = false }: Props) {
  if (decorative) {
    return (
      <div className={card}>
        <Body a={a} />
      </div>
    );
  }
  return (
    <button
      type="button"
      tabIndex={passive ? -1 : 0}
      aria-haspopup="dialog"
      onClick={(e) => onOpen(a, e.currentTarget)}
      className={`${card} ${interactive}`}
    >
      <Body a={a} />
    </button>
  );
}
