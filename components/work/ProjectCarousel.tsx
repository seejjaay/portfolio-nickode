"use client";

import Link from "next/link";
import { useEffect, useImperativeHandle, useRef, type PointerEvent, type Ref } from "react";
import type { Project } from "@/content/projects";
import { applyPosition, CARD } from "@/lib/carousel";

/* Project carousel on the laptop screen (DESIGN.md 7.4, Figma 33:71). Sized in
   Figma pixels for the 972x597 display; the laptop's zoom scales it. The parent
   owns the position (scroll-scrubbed or buttons) and calls `ref.current.set`;
   cards are positioned imperatively so scrubbing never re-renders. */
export type CarouselHandle = { set: (position: number, animate: boolean) => void };

type Props = {
  projects: readonly Project[];
  active: number; // rounded current card, for the counter, dots and buttons
  onGo: (index: number) => void;
  ref?: Ref<CarouselHandle>;
};

const RINGS = [96.2, 177.6, 259, 347.8]; // concentric placeholder cover, centred at (420, 148)
const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectCarousel({ projects, active, onGo, ref }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const dragged = useRef(false); // a drag must not also count as a click on a card's link

  const cardsOf = () => [...rootRef.current!.querySelectorAll<HTMLElement>("[data-card]")];

  useImperativeHandle(ref, () => ({
    set: (position, animate) => {
      const cards = cardsOf();
      cards.forEach((c) => (c.style.transition = animate ? "transform 600ms var(--ease)" : "none"));
      applyPosition(cards, position);
    },
  }));

  // First layout, before the scene starts driving it.
  useEffect(() => {
    applyPosition(cardsOf(), 0);
  }, []);

  const down = (e: PointerEvent) => {
    startX.current = e.clientX;
    dragged.current = false;
  };
  const up = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    dragged.current = Math.abs(dx) > 8;
    if (Math.abs(dx) > 60) onGo(Math.max(0, Math.min(projects.length - 1, active + (dx < 0 ? 1 : -1))));
  };

  const last = projects.length - 1;
  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected projects"
      className="lp-carousel"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={() => (startX.current = null)}
    >
      <p className="lp-screen-eyebrow left-[28px]">WHAT I&apos;VE DONE</p>
      <p className="lp-screen-eyebrow right-[43px]" aria-live="polite">
        {pad(active + 1)} / {pad(projects.length)}
      </p>

      {projects.map((p, i) => (
        <article
          key={p.slug}
          data-card
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${projects.length}: ${p.title}`}
          className="lp-card"
          style={{ width: CARD.w, height: CARD.h }}
        >
          <div className="lp-card-art" />
          {RINGS.map((d) => (
            <span
              key={d}
              aria-hidden
              className="lp-ring"
              style={{ width: d, height: d, left: 420 - d / 2, top: 148 - d / 2 }}
            />
          ))}
          <div className="lp-card-shade" />
          <span className="lp-card-index">{pad(p.index)}</span>
          <span className="lp-card-label">{p.featured ? "FEATURED" : p.category}</span>
          <span className="lp-card-title">{p.title}</span>
          <Link
            href={`/projects/${p.slug}`}
            prefetch={false}
            draggable={false}
            tabIndex={i === active ? 0 : -1}
            aria-label={`View project: ${p.title}`}
            className="lp-card-link"
            onClick={(e) => {
              if (dragged.current || i !== active) e.preventDefault();
              if (!dragged.current && i !== active) onGo(i);
              dragged.current = false;
            }}
          >
            <span className="lp-card-view">{"VIEW PROJECT  →"}</span>
          </Link>
          <div className="lp-card-dim" />
        </article>
      ))}

      <button
        type="button"
        aria-label="Previous project"
        disabled={active === 0}
        onClick={() => onGo(active - 1)}
        className="lp-nav left-[392px]"
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Next project"
        disabled={active === last}
        onClick={() => onGo(active + 1)}
        className="lp-nav left-[540px]"
      >
        →
      </button>
      <div className="lp-dots">
        {projects.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            aria-label={`Go to ${p.title}`}
            aria-current={i === active}
            onClick={() => onGo(i)}
            className={i === active ? "is-active" : ""}
          />
        ))}
      </div>
    </div>
  );
}
