"use client";

import { useEffect, useRef } from "react";
import { readTokenRgb, type Rgb } from "@/lib/canvas";
import { clamp, mulberry32 } from "@/lib/motion";

/* Space background (DESIGN.md 5.1). A fixed canvas behind the page: blurred
   haze clouds and three star layers. Everything is drawn in the --text color,
   so light mode becomes faint ink dust with no separate art.

   Star and haze numbers are measured from Figma's space background (node
   9:94, a 1440x7651 page): layer counts, radii, opacities, haze size, 5% haze
   opacity and 90px blur. `scroll` is the layer's parallax speed as a fraction
   of page scroll and `loop` is seconds for the slow upward drift to cover one
   viewport. */
const FIGMA_AREA = 1440 * 7651;
const DENSITY = 1;

const LAYERS = [
  { count: 360, radius: [0.6, 0.9], alpha: [0.15, 0.79], scroll: 0.1, loop: 120 },
  { count: 117, radius: [1.0, 1.5], alpha: [0.31, 0.7], scroll: 0.22, loop: 90 },
  { count: 36, radius: [1.52, 2.08], alpha: [0.6, 0.95], scroll: 0.38, loop: 60 },
] as const;

// [cx, cy, rx, ry] on Figma's 1440-wide page.
const HAZE = [
  [300, 850, 500, 350],
  [1270, 2300, 450, 400],
  [450, 4080, 550, 380],
  [1260, 5700, 500, 400],
  [650, 6900, 450, 300],
] as const;
const HAZE_ALPHA = 0.05;
const HAZE_BLUR = 90;
// Figma's page is spread over 7651px; compressing it lets the haze drift past
// at about half of scroll speed instead of tracking the page 1:1.
const HAZE_SPAN = 0.6;
// Haze is smooth, so it is rendered at a quarter of the resolution.
const HAZE_RES = 0.25;

const SHOT_EVERY = [15, 25] as const; // seconds between shooting stars
const SHOT_DURATION = 0.9;

type Star = { x: number; y: number; r: number; a: number };
type Shot = { x: number; y: number; dx: number; dy: number; start: number };

function erf(x: number) {
  const sign = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-x * x);
  return sign * y;
}

/* Pre-renders the five haze clouds. Each is a radial gradient shaped like a
   Gaussian-blurred ellipse, which avoids ctx.filter (missing in older Safari). */
function buildHaze(width: number, rgb: Rgb) {
  const sx = width / 1440;
  const patternH = 7651 * sx * HAZE_SPAN;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * HAZE_RES));
  canvas.height = Math.max(1, Math.round(patternH * HAZE_RES));
  const ctx = canvas.getContext("2d")!;
  const q = HAZE_RES * sx;

  for (const [cx, cy, rx, ry] of HAZE) {
    // Gradient space: 1 = the ellipse edge. Blur softens it over about 2.5 sigma.
    const sigma = (HAZE_BLUR / rx + HAZE_BLUR / ry) / 2;
    const reach = 1 + 2.5 * sigma;
    ctx.save();
    ctx.translate(cx * q, cy * q * HAZE_SPAN);
    ctx.scale(rx * q, ry * q);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const coverage = 0.5 * (1 - erf((u * reach - 1) / (sigma * Math.SQRT2)));
      gradient.addColorStop(u, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${HAZE_ALPHA * coverage})`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
    ctx.restore();
  }
  return { canvas, patternH };
}

function makeStars(width: number, height: number): Star[][] {
  return LAYERS.map((layer, i) => {
    const rand = mulberry32(i * 1013 + 7);
    const n = Math.max(4, Math.round((layer.count / FIGMA_AREA) * width * height * DENSITY));
    return Array.from({ length: n }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: layer.radius[0] + rand() * (layer.radius[1] - layer.radius[0]),
      a: layer.alpha[0] + rand() * (layer.alpha[1] - layer.alpha[0]),
    }));
  });
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let maxScroll = 0;
    let rgb: Rgb = [255, 255, 255];
    let stars: Star[][] = [];
    let haze: ReturnType<typeof buildHaze> | null = null;
    let reduced = motion.matches;
    let frame = 0;
    let shot: Shot | null = null;
    const start = performance.now();
    const nextShotDelay = () =>
      (SHOT_EVERY[0] + Math.random() * (SHOT_EVERY[1] - SHOT_EVERY[0])) * 1000;
    let nextShot = start + nextShotDelay();

    const measureScroll = () => {
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rgb = readTokenRgb(ctx, "--text");
      stars = makeStars(width, height);
      haze = buildHaze(width, rgb);
      measureScroll();
    };

    const spawnShot = (now: number) => {
      const angle = ((20 + Math.random() * 15) * Math.PI) / 180;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const dist = 520 + Math.random() * 200;
      shot = {
        x: width * (0.15 + Math.random() * 0.7),
        y: height * (0.05 + Math.random() * 0.4),
        dx: Math.cos(angle) * dist * dir,
        dy: Math.sin(angle) * dist,
        start: now,
      };
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const [r, g, b] = rgb;
      const scrollY = window.scrollY;
      const t = reduced ? 0 : (now - start) / 1000;

      if (haze) {
        const progress = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0;
        const offset = progress * Math.max(0, haze.patternH - height);
        ctx.drawImage(
          haze.canvas,
          0, offset * HAZE_RES, haze.canvas.width, Math.min(height * HAZE_RES, haze.canvas.height),
          0, 0, width, height,
        );
      }

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      stars.forEach((layer, i) => {
        const { scroll, loop } = LAYERS[i];
        const shift = scrollY * scroll + (t * height) / loop;
        for (const s of layer) {
          const y = (((s.y - shift) % height) + height) % height;
          ctx.globalAlpha = s.a;
          ctx.beginPath();
          ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      if (!reduced) {
        if (!shot && now >= nextShot) spawnShot(now);
        if (shot) {
          const u = (now - shot.start) / (SHOT_DURATION * 1000);
          if (u >= 1) {
            shot = null;
            nextShot = now + nextShotDelay();
          } else {
            const hx = shot.x + shot.dx * u;
            const hy = shot.y + shot.dy * u;
            const len = Math.hypot(shot.dx, shot.dy);
            const tail = 140;
            const tx = hx - (shot.dx / len) * tail;
            const ty = hy - (shot.dy / len) * tail;
            const alpha = Math.sin(Math.PI * u) * 0.7;
            const line = ctx.createLinearGradient(tx, ty, hx, hy);
            line.addColorStop(0, `rgba(${r},${g},${b},0)`);
            line.addColorStop(1, `rgba(${r},${g},${b},${alpha})`);
            ctx.strokeStyle = line;
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(hx, hy);
            ctx.stroke();
          }
        }
      }
    };

    const loop = (now: number) => {
      render(now);
      frame = requestAnimationFrame(loop);
    };

    // Reduced motion: drift and shooting stars stop, parallax stays. With no
    // running loop, a frame is redrawn only when scroll, size or theme changes.
    let scrollPending = false;
    const onScroll = () => {
      if (!reduced || scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        render(performance.now());
      });
    };

    const refresh = () => {
      cancelAnimationFrame(frame);
      shot = null;
      if (reduced) render(performance.now());
      else frame = requestAnimationFrame(loop);
    };

    const onResize = () => {
      setup();
      refresh();
    };
    const onMotionChange = () => {
      reduced = motion.matches;
      refresh();
    };

    setup();
    refresh();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    motion.addEventListener("change", onMotionChange);
    const themeObserver = new MutationObserver(onResize);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const sizeObserver = new ResizeObserver(() => {
      measureScroll();
      if (reduced) render(performance.now());
    });
    sizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      motion.removeEventListener("change", onMotionChange);
      themeObserver.disconnect();
      sizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-(image:--vignette)"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
