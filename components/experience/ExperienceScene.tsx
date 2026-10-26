"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { clamp, smoothstep } from "@/lib/motion";
import { createMountain } from "@/lib/mountain";

/* Mountain disperse scene (DESIGN.md 7.7, Figma board 50:59). The section is
   `position: sticky` for about 200vh of scroll (the track's bottom padding);
   progress p = 0 to 1 over that range drives everything:
     0 - 0.85   the mountain breaks into tiles that drift up and away
     0.30-0.52  the centred intro title fades out
     0.40-0.82  the real header and the accordion rows fade and slide up into
                place, one after another
     0 - 0.50   a 170px orb (mix-blend-mode: difference) follows the pointer,
                inverting whatever it crosses, and fades out by 0.5
   Under reduced motion none of this runs (CSS shows the final section). */
const PIN_VH = 2;
const NAV_RESERVE = 100; // the fixed nav covers the top 100px, so the mountain starts below it
const ORB_LERP = 0.15; // per 60fps frame
const ORB_HOME = { x: 0.415, y: 0.348 }; // where the orb waits (Figma), as a fraction of the stage

export function ExperienceScene({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const track = trackRef.current!;
    const stage = stageRef.current!;
    const art = artRef.current!;
    const intro = introRef.current!;
    const orb = orbRef.current!;
    const mountain = createMountain(canvasRef.current!);
    const reveals = [...stage.querySelectorAll<HTMLElement>("[data-exp-reveal]")];
    const orbSize = orb.offsetWidth;

    let progress = 0;
    let drawn = -1;
    let dirty = true;
    let inView = true;
    let frame = 0;
    let last = 0;
    let sized = false;
    const orbPos = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    mountain.onChange = () => (dirty = true);
    const themeNow = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
    mountain.load(themeNow());

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      mountain.resize(width, height);
      if (!sized) {
        sized = true;
        orbPos.x = target.x = width * ORB_HOME.x;
        orbPos.y = target.y = height * ORB_HOME.y;
      }
    });
    ro.observe(art);

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: "200px" });
    io.observe(track);

    const themeObserver = new MutationObserver(() => mountain.load(themeNow()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const aim = (e: PointerEvent) => {
      const r = art.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
    };
    stage.addEventListener("pointermove", aim, { passive: true });
    stage.addEventListener("pointerdown", aim, { passive: true });

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 100) : 16.67;
      last = now;
      if (!inView && drawn >= 0) return;

      progress = clamp(-track.getBoundingClientRect().top / (window.innerHeight * PIN_VH), 0, 1);

      // Mountain
      if (dirty || progress !== drawn) {
        mountain.draw(progress, NAV_RESERVE);
        drawn = progress;
        dirty = false;
      }

      // Intro title leaves
      const gone = smoothstep(0.3, 0.52, progress);
      intro.style.opacity = String(1 - gone);
      intro.style.transform = `translate3d(0, ${-gone * 30}px, 0)`;

      // Header and rows settle in, one after another
      reveals.forEach((el, i) => {
        const start = i === 0 ? 0.4 : 0.46 + (i - 1) * 0.07;
        const a = smoothstep(start, start + 0.22, progress);
        el.style.opacity = String(a);
        el.style.transform = a >= 1 ? "" : `translate3d(0, ${(1 - a) * 40}px, 0)`;
        el.style.pointerEvents = a < 0.6 ? "none" : "";
      });

      // Orb
      const orbOpacity = 1 - smoothstep(0.25, 0.5, progress);
      if (orbOpacity > 0 || orb.style.opacity !== "0") {
        const k = 1 - Math.pow(1 - ORB_LERP, dt / 16.67);
        orbPos.x += (target.x - orbPos.x) * k;
        orbPos.y += (target.y - orbPos.y) * k;
        orb.style.opacity = String(orbOpacity);
        orb.style.transform = `translate3d(${orbPos.x - orbSize / 2}px, ${orbPos.y - orbSize / 2}px, 0)`;
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      stage.removeEventListener("pointermove", aim);
      stage.removeEventListener("pointerdown", aim);
    };
  }, []);

  return (
    <div ref={trackRef} className="exp-track">
      <div ref={stageRef} className="exp-stage">
        <div ref={artRef} aria-hidden className="exp-art">
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />
          <div ref={introRef} className="exp-intro">
            <p className="font-display text-[clamp(14px,1.53vw,26px)] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-2">
              05 — EXPERIENCE
            </p>
            <p className="font-display text-[clamp(36px,5.56vw,96px)] font-semibold uppercase leading-[1.1] tracking-[0.025em] text-text">
              WHERE I&apos;VE BEEN SO FAR
            </p>
          </div>
        </div>
        <div className="relative z-10">{children}</div>
        <div ref={orbRef} aria-hidden className="exp-orb" />
      </div>
    </div>
  );
}
