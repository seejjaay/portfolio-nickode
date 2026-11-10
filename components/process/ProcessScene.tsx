"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { priceListPdf } from "@/content/pricing";
import { steps } from "@/content/process";
import { clamp, smoothstep } from "@/lib/motion";
import { collapsePin, isScrolling } from "@/lib/scroll";
import { btnPrimary, textLink } from "./styles";

/* How we'll work (DESIGN.md 7.3.2). A pinned scene, 200vh of scroll: a line is
   drawn left to right through six steps, the row pans sideways to keep the
   head of the line in view, and each step lights as the line reaches it. Once
   complete it stays complete, and the scroll spacer is removed so scrolling
   back up passes it in one screen (as in What I use). The rail is a real
   horizontal scroller: scroll drives it until the visitor takes over (swipe,
   sideways wheel, mouse drag, the arrow buttons or the keyboard), after which
   they can pan freely. Reduced motion: no pin, no line, the six steps in a grid
   (all in CSS). The button is always there. */
const PIN_VH = 2;
const MARK_R = 10; // half the marker (20px): the line runs through its centre

export function ProcessScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = trackRef.current!;
    const rail = railRef.current!;
    const row = rowRef.current!;
    const prog = progRef.current!;
    const items = Array.from(row.querySelectorAll<HTMLElement>(".pr-step"));

    let xs: number[] = []; // marker centres, in row coordinates
    let vw = 0;
    let panMax = 0;
    let anchor = 0.4; // where on screen the head of the line is held while panning
    let p = 0;
    let lastSet = 0; // the scrollLeft we last wrote: any other value means the visitor moved it
    let userPan = false; // the visitor has taken over the pan

    const syncButtons = () => {
      prevRef.current!.disabled = rail.scrollLeft <= 2;
      nextRef.current!.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;
    };
    const measure = () => {
      vw = rail.clientWidth;
      panMax = Math.max(0, rail.scrollWidth - vw);
      xs = items.map((el) => el.offsetLeft + MARK_R);
      // Chosen so the pan reaches its end exactly as the line does (when it can).
      anchor = clamp((xs[xs.length - 1] - panMax) / vw, 0.2, 0.6);
    };
    const apply = () => {
      const head = xs[0] + 4 + p * (xs[xs.length - 1] - xs[0]);
      prog.style.transform = `scaleX(${p})`;
      if (!userPan) {
        rail.scrollLeft = clamp(head - anchor * vw, 0, panMax);
        lastSet = rail.scrollLeft;
      }
      items.forEach((el, i) => el.style.setProperty("--lit", smoothstep(xs[i] - 28, xs[i] + 4, head).toFixed(3)));
    };

    const onScroll = () => {
      if (Math.abs(rail.scrollLeft - lastSet) > 2) userPan = true;
      syncButtons();
    };
    rail.addEventListener("scroll", onScroll, { passive: true });

    // Mouse drag (touch and trackpads scroll the container natively).
    let drag: { x: number; left: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: rail.scrollLeft };
      rail.setPointerCapture(e.pointerId);
      rail.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (drag) rail.scrollLeft = drag.left - (e.clientX - drag.x);
    };
    const onUp = () => {
      drag = null;
      rail.classList.remove("is-dragging");
    };
    rail.addEventListener("pointerdown", onDown);
    rail.addEventListener("pointermove", onMove);
    rail.addEventListener("pointerup", onUp);
    rail.addEventListener("pointercancel", onUp);

    const step = (dir: 1 | -1) => () => {
      userPan = true;
      rail.scrollBy({ left: dir * (items[1].offsetLeft - items[0].offsetLeft), behavior: "smooth" });
    };
    const onPrev = step(-1);
    const onNext = step(1);
    prevRef.current!.addEventListener("click", onPrev);
    nextRef.current!.addEventListener("click", onNext);

    measure();
    apply();
    syncButtons();
    const ro = new ResizeObserver(() => {
      measure();
      apply();
    });
    ro.observe(rail);

    let frame = 0;
    let inView = true;
    let passed = false; // scrolled fully past it: the scene is finished, wherever the visitor went
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        passed = !e.isIntersecting && e.boundingClientRect.bottom < 0;
      },
      { rootMargin: "200px" },
    );
    io.observe(track);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!inView && !passed) return;
      const raw = passed ? 1 : clamp(-track.getBoundingClientRect().top / (window.innerHeight * PIN_VH), 0, 1);
      if (raw >= 0.999) {
        p = 1;
        apply();
        // Once the page is at rest the scroll spacer goes; nothing is left to drive.
        if (!isScrolling()) {
          collapsePin(track, track.querySelector<HTMLElement>(".pr-stage")!);
          cancelAnimationFrame(frame);
        }
        return;
      }
      if (raw !== p) {
        if (raw < 0.01) userPan = false; // back above the scene: let the scrub drive again
        p = raw;
        apply();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      rail.removeEventListener("scroll", onScroll);
      rail.removeEventListener("pointerdown", onDown);
      rail.removeEventListener("pointermove", onMove);
      rail.removeEventListener("pointerup", onUp);
      rail.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={trackRef} className="pr-track">
      <div className="pr-stage">
        <SectionHeader eyebrow="03 — PROCESS" title="HOW WE'LL WORK" />

        <div ref={railRef} className="pr-rail" tabIndex={0} role="region" aria-label="The six steps. Scroll sideways to browse them.">
          <div ref={rowRef} className="pr-row">
            <div aria-hidden className="pr-line" />
            <div aria-hidden ref={progRef} className="pr-progress" />
            <ol className="contents">
              {steps.map((s) => (
                <li key={s.id} className="pr-step">
                  <span aria-hidden className="pr-mark">
                    <span className="pr-mark-fill" />
                  </span>
                  <div className="pr-body">
                    <p className="pr-index font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em]">
                      {String(s.index).padStart(2, "0")}
                    </p>
                    <h3 className="pr-title mt-2 font-display text-[clamp(22px,2vw,28px)] font-medium uppercase leading-[1.2] tracking-[0.03em]">
                      {s.title}
                    </h3>
                    <p className="pr-gist mt-3 font-body text-[17px] leading-[1.6]">{s.gist}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-[var(--gutter)]">
          <Link href="/process" className={btnPrimary}>
            PRICES &amp; PROCESS →
          </Link>
          <a href={priceListPdf.href} download={priceListPdf.file} className={textLink}>
            DOWNLOAD PRICE LIST ↓
          </a>
          <div className="pr-arrows ml-auto flex gap-3">
            <button ref={prevRef} type="button" aria-label="Previous steps" className="pr-arrow">
              <MaskIcon name="arrow-left" width={18} />
            </button>
            <button ref={nextRef} type="button" aria-label="Next steps" className="pr-arrow">
              <MaskIcon name="arrow-right" width={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
