"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { clamp, ease, lerp, smoothstep } from "@/lib/motion";
import { collapsePin, isScrolling } from "@/lib/scroll";
import { Laptop } from "./Laptop";
import { LID_END, type SceneState } from "./laptop-motion";
import { PopOutCards } from "./PopOutCards";
import { ProjectCarousel, type CarouselHandle } from "./ProjectCarousel";

/* Laptop scene (DESIGN.md 7.4, Figma board 34:115). Pinned for 220vh of scroll;
   progress p runs 0 to SHOW_END over that scroll and drives the opening only:
     0    - 0.35  the lid rotates open about the rear hinge (eased), the screen
                  lights, and the laptop slides down into frame
     0.35 - 0.55  the carousel fades and slides in on the screen, cards staggered
   The laptop itself is the three.js scene in LaptopScene, which reads `progress`
   for the lid and the slide; this file drives the carousel layer. Choosing a card
   is by the buttons, the dots or a swipe, never by scrolling: scroll used to
   scrub the carousel for another 180vh, which made the section a long wait.

   Once the laptop has opened it stays open however you scroll, up included, and
   as soon as the page is at rest the scroll spacer is removed (collapsePin), so
   moving past the section up or down takes one screen, open or closed. Clicking
   the keyboard closes it (lid shuts, carousel fades out first); it stays shut
   until you click the laptop to open it again.

   Under 900px (a phone) the screen is too small for the carousel to read, so
   PopOutCards is driven instead: once the lid is up, card 1 rises out of the
   screen at full width, and the buttons bring up the next card while the last one
   lifts away. Only transform and opacity change. Under reduced motion the laptop
   is already open with the carousel visible. */
const PIN_VH = 2.2; // keep in step with .lp-track::after
const SHOW_START = 0.35;
const SHOW_END = 0.55;
const COMPACT_PX = 900; // under this the cards pop out of the screen instead of sitting on it

export function WorkScene({ projects }: { projects: readonly Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const handle = useRef<CarouselHandle | null>(null);
  const progress = useRef<SceneState>({ p: 0, lid: 0 });
  const chosen = useRef(0); // the card the visitor chose, which the pop-out cards glide to
  const [active, setActive] = useState(0);
  const count = projects.length;

  const go = useCallback(
    (index: number) => {
      const i = clamp(index, 0, count - 1);
      chosen.current = i;
      setActive(i);
      handle.current?.set(i, true);
    },
    [count],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      handle.current?.set(0, false);
      return;
    }
    handle.current?.set(chosen.current, false);

    const track = trackRef.current!;
    const rig = rigRef.current!;
    const layer = rig.querySelector<HTMLElement>("[data-layer]")!;
    const cards = [...rig.querySelectorAll<HTMLElement>("[data-card]")];
    const pops = [...track.querySelectorAll<HTMLElement>("[data-pop]")];
    const popStack = track.querySelector<HTMLElement>(".lp-pop-stack")!;

    let frame = 0;
    let inView = true;
    let started = false;
    let smooth = chosen.current; // the pop-out cards' position, eased toward the chosen card
    let lastNow = 0;
    let latched = false; // opened and settled: stays open on scroll
    let closed = false; // shut by a click on the keyboard
    let lid = 0;
    const state = progress.current;
    state.click = (part) => {
      if (lid > 0.85 && part === "base") {
        closed = true;
        latched = false;
      } else if (lid < 0.2) {
        closed = false;
        latched = true;
      }
    };
    let passed = false; // scrolled fully past it: the scene is finished, wherever the visitor went
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        passed = !e.isIntersecting && e.boundingClientRect.bottom < 0;
      },
      { rootMargin: "200px" },
    );
    io.observe(track);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!inView && !passed && started) return;
      started = true;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
      lastNow = now;

      const vh = window.innerHeight;
      const raw = passed ? 1 : clamp(-track.getBoundingClientRect().top / (vh * PIN_VH), 0, 1);
      const p = raw * SHOW_END;
      state.p = p;

      // Latch open once settled; a click-closed laptop re-arms at the top of the scene.
      if (!closed && p >= SHOW_END) latched = true;
      const target = closed ? 0 : latched ? 1 : ease(clamp(p / LID_END, 0, 1));
      lid = lerp(lid, target, 1 - Math.exp(-dt * 9));
      if (Math.abs(lid - target) < 0.001) lid = target;
      state.lid = lid;

      // Carousel: fades in once the lid is up (and out before it shuts), then scrubs
      const intro = closed ? 0 : latched ? 1 : smoothstep(SHOW_START, SHOW_END, p);
      const shown = intro * smoothstep(0.6, 1, lid);
      const compact = window.innerWidth < COMPACT_PX;
      smooth = lerp(smooth, chosen.current, 1 - Math.exp(-dt * 9));
      if (Math.abs(smooth - chosen.current) < 0.001) smooth = chosen.current;
      const position = smooth;
      if (compact) {
        // The on-screen carousel stays hidden (but laid out, so its projected rect
        // says where the screen is); the cards rise out of that spot instead.
        layer.style.opacity = "0";
        layer.style.visibility = "hidden";
        layer.setAttribute("inert", "");
        const screen = layer.getBoundingClientRect();
        const slot = popStack.getBoundingClientRect();
        const emerge = screen.top + screen.height * 0.45 - (slot.top + slot.height / 2);
        const front = Math.round(position);
        const from = clamp((screen.width / slot.width) * 0.9, 0.3, 0.9); // starts about the screen's size
        pops.forEach((el, i) => {
          const d = i - position;
          let y: number;
          let scale: number;
          let opacity: number;
          if (d >= 0) {
            // arriving: the next card rises out of the screen as the position nears it
            const t = Math.min(clamp(1 - d, 0, 1), shown);
            const e = ease(t);
            y = (1 - e) * emerge;
            scale = from + (1 - from) * e;
            opacity = smoothstep(0, 0.35, t);
          } else {
            // leaving: the card the position has passed lifts away and fades
            const t = clamp(-d, 0, 1);
            y = -t * 70;
            scale = 1 - 0.06 * t;
            opacity = (1 - smoothstep(0.1, 0.9, t)) * smoothstep(0, 0.35, shown);
          }
          el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
          el.style.opacity = String(opacity);
          const interactive = i === front && shown > 0.9;
          el.style.pointerEvents = interactive ? "auto" : "none";
          el.toggleAttribute("inert", !interactive);
        });
      } else {
        layer.style.opacity = String(shown);
        layer.style.visibility = shown > 0.001 ? "visible" : "hidden";
        layer.toggleAttribute("inert", shown < 0.6);
        cards.forEach((card, i) => {
          const delay = 0.02 * i; // staggered entrance, centre card first
          const enter = closed || latched ? 1 : smoothstep(SHOW_START + delay, SHOW_END + delay, p);
          card.style.setProperty("--enter", String(enter));
        });
      }
      // Opened and settled, and the page is at rest: the scroll spacer goes.
      if (latched && raw >= 0.999 && !isScrolling()) collapsePin(track, track.querySelector<HTMLElement>(".lp-stage")!);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      state.click = undefined;
    };
  }, [count]);

  return (
    <div ref={trackRef} className="lp-track">
      <div className="lp-stage">
        <p aria-hidden className="lp-backdrop">
          WHAT I&apos;VE DONE
        </p>
        <button type="button" onClick={() => progress.current.click?.(progress.current.lid > 0.85 ? "base" : "lid")} className="lp-toggle">
          Open or close the laptop
        </button>
        <div ref={rigRef} className="lp-rig">
          <Laptop progress={progress}>
            <ProjectCarousel ref={handle} projects={projects} active={active} onGo={go} />
          </Laptop>
        </div>
        <PopOutCards projects={projects} active={active} onGo={go} />
      </div>
    </div>
  );
}
