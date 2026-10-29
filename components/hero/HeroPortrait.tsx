"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { clamp } from "@/lib/motion";
import { portraitBoxStyle } from "./geometry";

/* Grayscale cutout with a true-color circle under the pointer (DESIGN.md 7.1).
   Two stacked copies of the cutout: grayscale below, color above, with the
   color revealed through a radial mask. The color image is the same cutout, so
   its own alpha keeps the color inside the silhouette. */
const RADIUS = 140;
const TOUCH_RADIUS = 100;
const SOLID = 60; // percent of the radius that stays fully colored; the rest feathers out
const GROW_MS = 250;
const SHRINK_MS = 250;
const TOUCH_FADE_MS = 600;
const LERP = 0.18; // per 60fps frame

type Tween = { from: number; to: number; start: number; dur: number; linear?: boolean };

const still = (value: number): Tween => ({ from: value, to: value, start: 0, dur: 0 });
const sample = (t: Tween, now: number) => {
  const u = t.dur <= 0 ? 1 : clamp((now - t.start) / t.dur, 0, 1);
  const eased = t.linear ? u : 1 - Math.pow(1 - u, 3);
  return t.from + (t.to - t.from) * eased;
};

export function HeroPortrait() {
  const boxRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const box = boxRef.current!;
    const color = colorRef.current!;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let x = 0;
    let y = 0;
    let pointer = { x: 0, y: 0 }; // client coordinates of the last pointer event
    let radius = 0;
    let opacity = 1;
    let radiusTween = still(0);
    let opacityTween = still(1);
    let inside = false;
    let frame = 0;
    let last = 0;

    const apply = () => {
      if (radius < 0.5 || opacity <= 0.01) {
        color.style.visibility = "hidden";
        return;
      }
      const mask = `radial-gradient(circle ${radius}px at ${x}px ${y}px, #000 0, #000 ${SOLID}%, transparent 100%)`;
      color.style.visibility = "visible";
      color.style.opacity = String(opacity);
      color.style.maskImage = mask;
      color.style.webkitMaskImage = mask;
    };

    const tick = (now: number) => {
      const dt = last ? now - last : 16.67;
      last = now;

      // Read the box each frame so the circle stays under a still pointer
      // while the page scrolls.
      const rect = box.getBoundingClientRect();
      const tx = pointer.x - rect.left;
      const ty = pointer.y - rect.top;
      const k = motion.matches ? 1 : 1 - Math.pow(1 - LERP, dt / 16.67);
      x += (tx - x) * k;
      y += (ty - y) * k;

      radius = sample(radiusTween, now);
      opacity = sample(opacityTween, now);
      apply();

      const settled =
        !inside &&
        now - radiusTween.start >= radiusTween.dur &&
        now - opacityTween.start >= opacityTween.dur;
      if (settled) {
        if (radius < 0.5 || opacity <= 0.01) {
          radius = 0;
          opacity = 1;
          radiusTween = still(0);
          opacityTween = still(1);
          apply();
        }
        frame = 0;
        last = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const reveal = (e: PointerEvent, r: number) => {
      const rect = box.getBoundingClientRect();
      pointer = { x: e.clientX, y: e.clientY };
      if (!inside) {
        // Start under the pointer so the circle grows where the cursor is.
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      inside = true;
      const now = performance.now();
      radiusTween = { from: radius, to: r, start: now, dur: motion.matches ? 0 : GROW_MS };
      opacityTween = { from: opacity, to: 1, start: now, dur: 0 };
      run();
    };

    const hide = (touch: boolean) => {
      inside = false;
      const now = performance.now();
      const dur = motion.matches ? 0 : touch ? TOUCH_FADE_MS : SHRINK_MS;
      if (touch) opacityTween = { from: opacity, to: 0, start: now, dur, linear: true };
      else radiusTween = { from: radius, to: 0, start: now, dur };
      run();
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "touch") reveal(e, RADIUS);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") reveal(e, TOUCH_RADIUS);
    };
    const onMove = (e: PointerEvent) => {
      if (!inside) return;
      pointer = { x: e.clientX, y: e.clientY };
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") hide(false);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") hide(true);
    };

    box.addEventListener("pointerenter", onEnter);
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove, { passive: true });
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointerup", onUp);
    box.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("pointerenter", onEnter);
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerup", onUp);
      box.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className="hero-photo absolute touch-pan-y"
      style={portraitBoxStyle}
    >
      <Image
        src="/assets/hero/hero-gray.webp"
        alt="Portrait of NICK.ODE, seated, wearing sunglasses"
        width={2088}
        height={1530}
        loading="eager"
        fetchPriority="high"
        unoptimized
        draggable={false}
        className="pointer-events-none size-full select-none"
      />
      <Image
        ref={colorRef}
        src="/assets/hero/hero-color.webp"
        alt=""
        aria-hidden
        width={2088}
        height={1530}
        loading="eager"
        fetchPriority="low"
        unoptimized
        draggable={false}
        className="pointer-events-none invisible absolute inset-0 size-full select-none"
      />
    </div>
  );
}
