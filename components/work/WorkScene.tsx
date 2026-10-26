"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/content/projects";
import { positionAt } from "@/lib/carousel";
import { clamp, smoothstep } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";
import { Laptop } from "./Laptop";
import type { SceneState } from "./laptop-motion";
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
   drive it. */
const PIN_VH = 4;
const SHOW_START = 0.35;
const SHOW_END = 0.55;
const SCRUB_START = 0.55;

export function WorkScene({ projects }: { projects: readonly Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const handle = useRef<CarouselHandle | null>(null);
  const progress = useRef<SceneState>({ p: 0 });
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
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: "200px" });
    io.observe(track);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!inView && lastPos >= 0) return;

      const vh = window.innerHeight;
      const p = clamp(-track.getBoundingClientRect().top / (vh * PIN_VH), 0, 1);
      progress.current.p = p;

      // Carousel: fades in, then scrubs
      const shown = smoothstep(SHOW_START, SHOW_END, p);
      layer.style.opacity = String(shown);
      layer.style.visibility = shown > 0.001 ? "visible" : "hidden";
      layer.toggleAttribute("inert", shown < 0.6);
      cards.forEach((card, i) => {
        const delay = 0.02 * i; // staggered entrance, centre card first
        card.style.setProperty("--enter", String(smoothstep(SHOW_START + delay, SHOW_END + delay, p)));
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
    };
  }, [count]);

  return (
    <div ref={trackRef} className="lp-track">
      <div className="lp-stage">
        <p aria-hidden className="lp-backdrop">
          WHAT I&apos;VE DONE
        </p>
        <div ref={rigRef} className="lp-rig">
          <Laptop progress={progress}>
            <ProjectCarousel ref={handle} projects={projects} active={active} onGo={go} />
          </Laptop>
        </div>
      </div>
    </div>
  );
}
