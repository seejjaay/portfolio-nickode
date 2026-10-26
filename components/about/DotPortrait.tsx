"use client";

import { useEffect, useRef } from "react";
import grid from "@/content/about-dots.json";
import { readTokenRgb } from "@/lib/canvas";
import { clamp, mulberry32, smoothstep } from "@/lib/motion";
import { aboutScroll } from "@/lib/scroll";

/* Dot-matrix portrait (DESIGN.md 7.2.2). The level grid (0-9 per dot, from the
   grayscale cutout with CLAHE and gamma 0.78) is baked in about-dots.json.
   Geometry, radii and the motion numbers below come from the spec and Figma's
   dot field (node 42:59) and motion board (43:124). */
const WIDTH = grid.width;
const HEIGHT = grid.height;

const RADIUS_BASE = 0.45;
const RADIUS_PER_LEVEL = 0.3;
const BREATH_PERIOD = 6; // seconds
const BREATH_AMOUNT = 0.06;

const POINTER_RADIUS = 110;
const TOUCH_RADIUS = 140;
const PUSH = 44; // px, at the pointer
const SHRINK = 0.5; // scale at the pointer
const STIFFNESS = 0.08;
const DAMPING = 0.82;

// Scroll phases, as fractions of aboutScroll (0 = pin released, 1 = gone).
const RIPPLE_END = 0.4;
const SCATTER_END = 0.8;
const RIPPLE_AMPLITUDE = 8;
const RIPPLE_WAVELENGTH = 140;
const SINK_FROM = 0.75; // lower band (fraction of height) that shrinks and sinks
const FADE_TO = 0.85; // scatter fades dots by this much

type Dots = {
  count: number;
  x: Float32Array;
  y: Float32Array;
  level: Uint8Array;
  vecX: Float32Array;
  vecY: Float32Array;
  phase: Float32Array;
};

function buildDots(): Dots {
  const pts: { x: number; y: number; level: number }[] = [];
  grid.levels.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const level = row.charCodeAt(i) - 48;
      if (!level) continue;
      pts.push({
        x: grid.x0 + grid.pitchX * i + (j % 2 ? grid.stagger : 0),
        y: grid.y0 + grid.pitchY * j,
        level,
      });
    }
  });
  const rand = mulberry32(0x70a1);
  const n = pts.length;
  const dots: Dots = {
    count: n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    level: new Uint8Array(n),
    vecX: new Float32Array(n),
    vecY: new Float32Array(n),
    phase: new Float32Array(n),
  };
  pts.forEach((p, i) => {
    dots.x[i] = p.x;
    dots.y[i] = p.y;
    dots.level[i] = p.level;
    // Seeded scatter vector: sideways spread, always drifting up.
    dots.vecX[i] = (rand() - 0.5) * 360;
    dots.vecY[i] = -(60 + rand() * 220);
    dots.phase[i] = rand();
  });
  return dots;
}

export function DotPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dots = buildDots();
    const n = dots.count;

    // Spring state: offset and velocity per dot.
    const ox = new Float32Array(n);
    const oy = new Float32Array(n);
    const vx = new Float32Array(n);
    const vy = new Float32Array(n);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(WIDTH * dpr);
    canvas.height = Math.round(HEIGHT * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let rgb = readTokenRgb(ctx, "--text");
    let reduced = motion.matches;
    const pointer = { x: 0, y: 0, active: false, radius: POINTER_RADIUS };
    let visible = true;
    let frame = 0;
    let last = 0;
    let acc = 0;

    const render = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      const s = reduced ? 0 : aboutScroll.value;
      const breath = reduced ? 1 : 1 + BREATH_AMOUNT * Math.sin((t / BREATH_PERIOD) * Math.PI * 2);

      // Scroll-driven terms, shared by every dot this frame.
      const rippleOn = smoothstep(0, RIPPLE_END, s);
      const rippleAmp = RIPPLE_AMPLITUDE * rippleOn * (1 - smoothstep(RIPPLE_END, SCATTER_END, s));
      const travel = s * 1000;
      const scatter = clamp((s - RIPPLE_END) / (SCATTER_END - RIPPLE_END), 0, 1);
      const exit = clamp((s - SCATTER_END) / (1 - SCATTER_END), 0, 1);
      const scattering = s > RIPPLE_END;

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      if (!scattering) ctx.beginPath();

      for (let i = 0; i < n; i++) {
        const bx = dots.x[i];
        const by = dots.y[i];
        let px = bx + ox[i];
        let py = by + oy[i];
        let scale = breath;
        let alpha = 1;

        const sinkT = clamp((by / HEIGHT - SINK_FROM) / (1 - SINK_FROM), 0, 1);
        if (rippleOn > 0) {
          py += rippleAmp * Math.sin(((by - travel) / RIPPLE_WAVELENGTH) * Math.PI * 2);
          scale *= 1 - 0.6 * sinkT * rippleOn;
          py += 16 * sinkT * rippleOn;
        }

        if (scattering) {
          // Lower dots go first, the face last.
          const delay = 0.5 * (1 - by / HEIGHT);
          const u = clamp((scatter - delay) / 0.5, 0, 1);
          const k = 1 - Math.pow(1 - u, 3);
          px += dots.vecX[i] * (k + 0.3 * exit);
          py += dots.vecY[i] * (k + 0.3 * exit);
          alpha = (1 - FADE_TO * u) * (1 - exit);
          if (alpha <= 0.003) continue;
        }

        if (pointer.active) {
          const dx = bx - pointer.x;
          const dy = by - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < pointer.radius) scale *= 1 - (1 - SHRINK) * (1 - d / pointer.radius);
        }

        const r = (RADIUS_BASE + RADIUS_PER_LEVEL * dots.level[i]) * scale;
        if (r <= 0.05) continue;
        if (scattering) {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(px + r, py);
          ctx.arc(px, py, r, 0, Math.PI * 2);
        }
      }
      if (!scattering) ctx.fill();
      ctx.globalAlpha = 1;
    };

    // Spring toward the pointer-pushed target (fixed 60Hz steps).
    const step = () => {
      for (let i = 0; i < n; i++) {
        let tx = 0;
        let ty = 0;
        if (pointer.active) {
          const dx = dots.x[i] - pointer.x;
          const dy = dots.y[i] - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < pointer.radius) {
            const f = 1 - d / pointer.radius;
            // A dot exactly under the pointer has no direction; use its own phase.
            const a = d > 0.001 ? Math.atan2(dy, dx) : dots.phase[i] * Math.PI * 2;
            tx = Math.cos(a) * PUSH * f;
            ty = Math.sin(a) * PUSH * f;
          }
        }
        vx[i] = (vx[i] + (tx - ox[i]) * STIFFNESS) * DAMPING;
        vy[i] = (vy[i] + (ty - oy[i]) * STIFFNESS) * DAMPING;
        ox[i] += vx[i];
        oy[i] += vy[i];
      }
    };

    const loop = (now: number) => {
      const dt = last ? Math.min(now - last, 100) : 16.67;
      last = now;
      acc += dt;
      while (acc >= 16.67) {
        step();
        acc -= 16.67;
      }
      render(now);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (reduced) {
        ox.fill(0);
        oy.fill(0);
        render(performance.now());
      } else if (visible && !document.hidden) {
        frame = requestAnimationFrame(loop);
      }
    };

    const place = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * WIDTH;
      pointer.y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
      pointer.radius = e.pointerType === "touch" ? TOUCH_RADIUS : POINTER_RADIUS;
      pointer.active = true;
    };
    const onMove = (e: PointerEvent) => {
      if (!reduced) place(e);
    };
    const onEnd = () => {
      pointer.active = false;
    };

    const onTheme = () => {
      rgb = readTokenRgb(ctx, "--text");
      if (reduced) render(performance.now());
    };
    const onMotion = () => {
      reduced = motion.matches;
      pointer.active = false;
      start();
    };
    const onVisibility = () => start();

    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    // Pause the loop while the canvas is offscreen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(canvas);

    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onEnd);
    canvas.addEventListener("pointerup", onEnd);
    canvas.addEventListener("pointercancel", onEnd);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onEnd);
      canvas.removeEventListener("pointerup", onEnd);
      canvas.removeEventListener("pointercancel", onEnd);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Dot-matrix portrait of NICK.ODE"
      className="absolute -left-px -top-px touch-pan-y"
      style={{ width: "calc(100% + 2px)", height: "calc(100% + 2px)" }} // fills the box, which is 440x560 on desktop and scales down on a phone
    />
  );
}
