"use client";

import { useEffect, useRef } from "react";
import type { Service } from "@/content/services";
import { clamp, ease, smoothstep } from "@/lib/motion";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { ServiceCard } from "./ServiceCard";

/* Services folder and deck (DESIGN.md 7.3.1). The stage is pinned for 400vh by
   one ScrollTrigger and progress p = 0 to 1 drives everything (nothing is timed):
     0 - 0.15   the front flap opens (rotateX 0 to -100deg) and the folder drops 12%
     0.15 - 1   one beat of 0.17 per card: it starts in the folder mouth (down 60%
                of its height, scale .9, tilted 6deg, invisible), springs out with
                one small overshoot and settles into the deck. Each earlier card
                steps 28px up, x0.96 smaller, and dims to .6 (a veil over the card, so it still hides the cards behind it);
                the newest is on top.
   Only transform and opacity change. The scene is laid out at a fixed design size
   (see .svc-scene in globals.css) and scaled to fit the stage. Reduced motion
   skips all of this and CSS shows the folder open with the cards as a list. */
const PIN_VH = 4;
const OPEN_END = 0.15;
const BEAT = 0.17;
const SHIFT = 0.12; // folder drop, as a share of the scene's height
const FLAP_DEG = -100;
const ARRIVE = 0.75; // share of a beat a card takes to settle; the rest is a hold
const START = { y: 0.6, scale: 0.9, rotate: 6 }; // y is a share of the card's height
const STEP = { px: 28, scale: 0.96, opacity: 0.6 };
const BACK = 1.2; // overshoot strength (about 4%)

const easeOutBack = (t: number) => {
  const u = t - 1;
  return 1 + (BACK + 1) * u * u * u + BACK * u * u;
};

export function ServicesScene({ services }: { services: Service[] }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const scene = stage.querySelector<HTMLElement>(".svc-scene")!;
      const shift = stage.querySelector<HTMLElement>(".svc-shift")!;
      const flap = stage.querySelector<HTMLElement>(".svc-flap")!;
      const cards = [...stage.querySelectorAll<HTMLElement>("[data-svc-card]")];
      const veils = cards.map((el) => el.querySelector<HTMLElement>(".svc-veil")!);
      let sceneH = scene.offsetHeight;
      let cardH = cards[0].offsetHeight;

      // Scale the fixed-size scene down to fit short or narrow stages.
      const fit = () => {
        sceneH = scene.offsetHeight;
        cardH = cards[0].offsetHeight;
        const k = Math.min(1, stage.clientHeight / sceneH, stage.clientWidth / scene.offsetWidth);
        scene.style.setProperty("--svc-k", String(k));
      };

      const render = (p: number) => {
        const open = ease(clamp(p / OPEN_END, 0, 1));
        flap.style.transform = `rotateX(${FLAP_DEG * open}deg)`;
        shift.style.transform = `translate3d(0, ${open * SHIFT * sceneH}px, 0)`;
        stage.classList.toggle("is-open", p > 0.002); // the idle float stops once it starts opening

        const q = clamp((p - OPEN_END) / BEAT, 0, cards.length);
        cards.forEach((el, i) => {
          const local = q - i;
          const a = easeOutBack(clamp(local / ARRIVE, 0, 1));
          // How many cards have come out on top of this one (fractional while one is arriving).
          let behind = 0;
          for (let j = i + 1; j < cards.length; j++) behind += smoothstep(0, 1, clamp((q - j) / ARRIVE, 0, 1));
          const y = -STEP.px * behind + (1 - a) * START.y * cardH;
          const s = Math.pow(STEP.scale, behind) * (START.scale + (1 - START.scale) * a);
          const r = (i % 2 ? START.rotate : -START.rotate) * (1 - a);
          el.style.transform = `translate3d(0, ${y}px, 0) rotate(${r}deg) scale(${s})`;
          el.style.opacity = String(smoothstep(0, 0.2, local));
          veils[i].style.opacity = String((1 - STEP.opacity) * Math.min(1, behind));
        });
      };

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          fit();
          render(self.progress);
        },
        onUpdate: (self) => render(self.progress),
      });
    }, stage);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="svc-stage">
      <div className="svc-scene">
        <div aria-hidden className="svc-shift">
          <div className="svc-float">
            <div className="svc-folder">
              <div className="svc-back" />
              <div className="svc-tab">SERVICES · {String(services.length).padStart(2, "0")}</div>
              <div className="svc-flap" />
            </div>
          </div>
        </div>
        <ol className="svc-cards">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ol>
      </div>
    </div>
  );
}
