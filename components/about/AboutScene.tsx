"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { clamp, cubicBezier, lerp } from "@/lib/motion";
import { WaveCanvas } from "./WaveCanvas";
import { aboutScroll, gsap, ScrollTrigger } from "@/lib/scroll";

/* About wave transition (DESIGN.md 7.2.1). One pinned stage, 300vh of scroll,
   driven entirely by scroll progress p (0 to 1):
     0    - 0.60  wave rises from +67vh to -4vh; the title rides it at about
                   half its speed until it reaches the centre, then pins
     0.60 - 1.00  wave slowly scales 1.0 to 1.1 from bottom-left and drifts
     0.70 - 1.00  the screen splits at the centre seam; the halves slide apart
                   and About, already mounted behind, fades up (timed, staggered)
   The numbers are fitted to Figma's storyboard stills (node 31:59) at 0, 25,
   60 and 80%, which differ from the spec's prose (rise ending at 0.45, scale
   starting then, 0.6x title parallax). The stills won. The split eases with
   ease-out-cubic, since the 80% still has the halves 500px apart. */
const PIN_LENGTH_VH = 3;
const RISE_END = 0.6;
const SCALE_START = 0.6;
const SPLIT_START = 0.7;
const WAVE_START = 0.667; // wave top, as a fraction of stage height (Figma: 600 of 900)
const WAVE_END = -0.0367; // (Figma: -33 of 900)
const TITLE_START = 0.611; // title top at p=0 (Figma: 550 of 900)
const TITLE_PARALLAX = 0.5;
const splitEase = cubicBezier(0.215, 0.61, 0.355, 1);
// Dot-portrait scroll range: this fraction of a viewport of scroll after the pin releases.
const ABOUT_RANGE_VH = 0.55;

function WaveImage() {
  return (
    <>
      <Image
        src="/assets/wave/great-wave-dark.webp"
        alt=""
        width={1920}
        height={1291}
        unoptimized
        draggable={false}
        className="wave-dark size-full select-none object-cover"
      />
      <Image
        src="/assets/wave/great-wave-light.webp"
        alt=""
        width={1920}
        height={1291}
        unoptimized
        draggable={false}
        className="wave-light size-full select-none object-cover"
      />
    </>
  );
}

const skyFade =
  "pointer-events-none absolute inset-x-0 top-0 h-[17.6%] bg-linear-to-b from-bg to-transparent";

export function AboutScene({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // static stack, see globals.css

    const ctx = gsap.context(() => {
      const waves = [...stage.querySelectorAll<HTMLElement>("[data-wave]")];
      const titles = [...stage.querySelectorAll<HTMLElement>("[data-title]")];
      const seams = [...stage.querySelectorAll<HTMLElement>("[data-seam]")];
      const left = stage.querySelector<HTMLElement>("[data-half='left']")!;
      const right = stage.querySelector<HTMLElement>("[data-half='right']")!;
      const halves = stage.querySelector<HTMLElement>(".about-halves")!;
      let titleHeight = titles[0].offsetHeight;

      const render = (p: number) => {
        const W = stage.clientWidth;
        const H = halves.clientHeight; // the viewport; on a phone the stage itself is taller

        const rise = clamp(p / RISE_END, 0, 1);
        const y = lerp(WAVE_START * H, WAVE_END * H, rise);
        const grow = clamp((p - SCALE_START) / (1 - SCALE_START), 0, 1);
        const waveTransform = `translate3d(${-0.01 * W * grow}px, ${y}px, 0) scale(${1 + 0.1 * grow})`;
        for (const el of waves) el.style.transform = waveTransform;

        const travel = WAVE_START * H - y;
        const centerTop = (H - titleHeight) / 2;
        const titleY = Math.max(centerTop, TITLE_START * H - TITLE_PARALLAX * travel);
        for (const el of titles) el.style.transform = `translate3d(-50%, ${titleY}px, 0)`;

        const split = splitEase(clamp((p - SPLIT_START) / (1 - SPLIT_START), 0, 1));
        left.style.transform = `translate3d(${-split * 100}%, 0, 0)`;
        right.style.transform = `translate3d(${split * 100}%, 0, 0)`;
        const gone = split >= 1;
        left.style.visibility = right.style.visibility = gone ? "hidden" : "visible";
        stage.dataset.waveLive = gone ? "0" : "1"; // the wave shader stops once the halves are off screen
        for (const el of seams) el.style.opacity = String(clamp(split * 8, 0, 1));

        // About fades up (timed, 80ms stagger) once the split begins; the CSS
        // transition runs both ways, so scrolling back hides it again.
        stage.classList.toggle("is-open", p >= SPLIT_START);
      };

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_LENGTH_VH}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1, // pins a frame early on fast scrolls so the stage never jumps as it locks
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          titleHeight = titles[0].offsetHeight;
          render(self.progress);
        },
        onUpdate: (self) => render(self.progress),
      });

      // Dot portrait reads how far past the pin the visitor is.
      const track = () => {
        const top = stage.getBoundingClientRect().top;
        aboutScroll.value = clamp(-top / (ABOUT_RANGE_VH * window.innerHeight), 0, 1);
      };
      gsap.ticker.add(track);
      return () => {
        gsap.ticker.remove(track);
        aboutScroll.value = 0;
      };
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="about-stage">
      <div className="about-content-layer absolute inset-0 flex items-center">{children}</div>

      {/* Reduced motion only (see globals.css): the wave as a static divider. */}
      <div aria-hidden className="about-divider relative h-[50vh] overflow-hidden">
        <WaveImage />
        <div className={skyFade} />
      </div>

      <div className="about-halves pointer-events-none absolute inset-0 z-10 max-md:bottom-auto max-md:h-svh">
        {(["left", "right"] as const).map((side) => (
          <div
            key={side}
            data-half={side}
            className={`about-half absolute inset-y-0 w-1/2 overflow-hidden will-change-transform ${
              side === "left" ? "left-0" : "right-0"
            }`}
          >
            {/* Each half draws the whole scene, offset so the two halves join
                up exactly at the centre seam. */}
            <div
              className="absolute top-0 h-full w-[200%]"
              style={{ left: side === "left" ? 0 : "-100%" }}
            >
              <div
                data-wave
                className="about-wave absolute left-0 top-0 aspect-1920/1291 min-h-[107.5%] w-full origin-bottom-left will-change-transform"
                style={{ transform: `translate3d(0, ${WAVE_START * 100}svh, 0)` }}
              >
                <WaveImage />
                <WaveCanvas side={side} />
              </div>
              <div
                aria-hidden
                data-title
                className="absolute left-1/2 top-0 whitespace-nowrap font-display text-[20.83vw] font-semibold uppercase leading-none tracking-[0.02em] text-blend-white mix-blend-difference"
                style={{ transform: `translate3d(-50%, ${TITLE_START * 100}svh, 0)` }}
              >
                ABOUT ME
              </div>
            </div>
            <span
              data-seam
              className={`absolute top-0 h-full w-px bg-border-strong opacity-0 ${
                side === "left" ? "right-0" : "left-0"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
