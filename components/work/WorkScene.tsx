"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { positionAt } from "@/lib/carousel";
import { clamp, ease, lerp, smoothstep } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { Laptop } from "./Laptop";
import { LID_END, type SceneState } from "./laptop-motion";
import { ProjectCarousel, type CarouselHandle } from "./ProjectCarousel";

/* Laptop scene (DESIGN.md 7.4, Figma board 34:115). Pinned for 400vh of scroll;
   progress p = 0 to 1 drives everything:
     0    - 0.35  the lid rotates open about the rear hinge (eased), the screen
                  lights, and the laptop slides down into frame
     0.35 - 0.55  the carousel fades and slides in on the screen, cards staggered
     0.55 - 1.00  the laptop stays open and still; scrolling now just moves the
                  carousel, card 1 to card N, and the pin releases at the last card
   (The spec's dolly-in is gone on purpose: it was not wanted.) The laptop itself
   is the three.js scene in LaptopScene, which reads `progress` for the lid and the
   slide; this file drives the carousel layer and its position. Under reduced
   motion the laptop is already open with the carousel visible and the buttons
   drive it.

   Once the laptop has opened and the carousel is in (p past SHOW_END) it stays
   open however you scroll, up included. Clicking the keyboard closes it (lid shuts,
   carousel fades out first); it stays shut until you click the laptop to open it
   again, or scroll back to the very top of the scene and come down once more. */
const PIN_VH = 4;
const SHOW_START = 0.35;
const SHOW_END = 0.55;
const SCRUB_START = 0.55;

export function WorkScene({ projects }: { projects: readonly Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const handle = useRef<CarouselHandle | null>(null);
  const progress = useRef<SceneState>({ p: 0, lid: 0 });
  const pinned = useRef(true);
  const [active, setActive] = useState(0);
  const count = projects.length;

  const go = useCallback(
    (index: number) => {
      const i = clamp(index, 0, count - 1);
      if (!pinned.current) {
        setActive(i);
        handle.current?.set(i, true);
        return;
      }
      const track = trackRef.current!;
      const top = track.getBoundingClientRect().top + window.scrollY;
      const p = SCRUB_START + (1 - SCRUB_START) * (i / (count - 1));
      scrollToY(top + p * window.innerHeight * PIN_VH);
    },
    [count],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pinned.current = false;
      handle.current?.set(0, false);
      return;
    }
    pinned.current = true;

    const track = trackRef.current!;
    const rig = rigRef.current!;
    const layer = rig.querySelector<HTMLElement>("[data-layer]")!;
    const cards = [...rig.querySelectorAll<HTMLElement>("[data-card]")];

    let frame = 0;
    let inView = true;
    let lastIndex = -1;
    let lastPos = -1;
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
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: "200px" });
    io.observe(track);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!inView && lastPos >= 0) return;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
      lastNow = now;

      const vh = window.innerHeight;
      const p = clamp(-track.getBoundingClientRect().top / (vh * PIN_VH), 0, 1);
      state.p = p;

      // Latch open once settled; a click-closed laptop re-arms at the top of the scene.
      if (!closed && p >= SHOW_END) latched = true;
      if (closed && p < 0.02) closed = false;
      const target = closed ? 0 : latched ? 1 : ease(clamp(p / LID_END, 0, 1));
      lid = lerp(lid, target, 1 - Math.exp(-dt * 9));
      if (Math.abs(lid - target) < 0.001) lid = target;
      state.lid = lid;

      // Carousel: fades in once the lid is up (and out before it shuts), then scrubs
      const intro = closed ? 0 : latched ? 1 : smoothstep(SHOW_START, SHOW_END, p);
      const shown = intro * smoothstep(0.6, 1, lid);
      layer.style.opacity = String(shown);
      layer.style.visibility = shown > 0.001 ? "visible" : "hidden";
      layer.toggleAttribute("inert", shown < 0.6);
      cards.forEach((card, i) => {
        const delay = 0.02 * i; // staggered entrance, centre card first
        const enter = closed || latched ? 1 : smoothstep(SHOW_START + delay, SHOW_END + delay, p);
        card.style.setProperty("--enter", String(enter));
      });
      const position = positionAt((p - SCRUB_START) / (1 - SCRUB_START), count);
      if (position !== lastPos) {
        lastPos = position;
        handle.current?.set(position, false);
        const index = Math.round(position);
        if (index !== lastIndex) {
          lastIndex = index;
          setActive(index);
        }
      }
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
      </div>
    </div>
  );
}
