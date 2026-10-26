"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp, ease, lerp } from "@/lib/motion";
import { MAX_GEN, sharedNetwork } from "@/lib/network";

/* The tech-stack network on a 2D canvas (DESIGN.md 7.5). `progress.p` (0 to 1)
   is the scroll progress through the pinned scene and drives growth:
     0 - 0.85   growth 0 to 7, one unit per generation of the graph
     0.85 - 1   the logo nodes pop in, 60ms-style stagger (by progress)
     at 1       drag to spin on any axis with inertia, easing back to a slow
                auto-rotation; hover a logo node for its name
   Sizes are Figma px for a radius-310 sphere and scale with the canvas. Colours
   are the --text / --bg tokens, so it follows the theme. Under reduced motion it
   draws the finished network once and nothing moves. */
const FIGMA_R = 310;
const GROW_END = 0.85;
const POP_DUR = 0.05;
const AUTO = 0.12; // rad/s
const BASE_YAW = 0;
const BASE_PITCH = 0;
const FOCAL = 8; // in sphere radii: near-orthographic, like the Figma

type Props = {
  progress: RefObject<{ p: number }>;
  label: string;
  className?: string;
};

const rgbOf = (css: string): [number, number, number] => {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
};

export function NetworkCanvas({ progress, label, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const net = sharedNetwork();

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frozen = reduced;
    const { nodes, edges, logos } = net;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let fg: [number, number, number] = [255, 255, 255];
    let bg: [number, number, number] = [0, 0, 0];
    let family = "sans-serif";
    const readTokens = () => {
      const cs = getComputedStyle(document.documentElement);
      fg = rgbOf(cs.getPropertyValue("--text").trim() || "#fff");
      bg = rgbOf(cs.getPropertyValue("--bg").trim() || "#000");
      family = getComputedStyle(canvas).fontFamily || "sans-serif";
    };
    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    // Tech icons: each SVG is loaded once and painted in the theme colour (drawn to
    // a small canvas, then filled with the colour "source-in"). A node whose icon is
    // missing or still loading shows its text label instead.
    const images = new Map<string, HTMLImageElement>();
    const tinted = new Map<string, HTMLCanvasElement>();
    for (const l of logos) {
      if (!l.icon || images.has(l.icon)) continue;
      const img = new Image();
      img.onload = () => frozen && draw(performance.now());
      img.src = `/assets/tech/${l.icon}.svg`;
      images.set(l.icon, img);
    }
    const iconFor = (slug: string) => {
      const img = images.get(slug);
      if (!img || !img.complete || !img.naturalWidth) return null;
      const key = `${slug}|${fg.join(",")}`;
      let c = tinted.get(key);
      if (!c) {
        c = document.createElement("canvas");
        c.width = c.height = 96;
        const x = c.getContext("2d")!;
        x.drawImage(img, 0, 0, 96, 96);
        x.globalCompositeOperation = "source-in";
        x.fillStyle = rgba(fg, 1);
        x.fillRect(0, 0, 96, 96);
        tinted.set(key, c);
      }
      return c;
    };

    // View state
    let yaw = BASE_YAW;
    let pitch = BASE_PITCH;
    let vYaw = AUTO;
    let vPitch = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let hover = -1;
    const hoverT = new Float32Array(logos.length);
    let interactive = false;

    const px = new Float32Array(nodes.length);
    const py = new Float32Array(nodes.length);
    const pz = new Float32Array(nodes.length);
    const ps = new Float32Array(nodes.length);
    const edgeOrder = edges.map((_, i) => i);
    const edgeZ = new Float32Array(edges.length);
    const nodeOrder = nodes.map((_, i) => i);

    const size = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };

    const draw = (now: number) => {
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
      lastT = now;
      const t = now / 1000;
      const p = frozen ? 1 : clamp(progress.current.p, 0, 1);
      const growth = Math.min(MAX_GEN, (p / GROW_END) * MAX_GEN);
      const isInteractive = !frozen && p >= 0.995;
      if (isInteractive !== interactive) {
        interactive = isInteractive;
        canvas.style.pointerEvents = interactive ? "auto" : "none";
        canvas.style.cursor = interactive ? "grab" : "default";
        if (!interactive) hover = -1;
      }

      // Spin: inertia from the drag, easing back to the slow auto-rotation
      if (!frozen && interactive && !dragging) {
        vYaw = lerp(vYaw, AUTO, 1 - Math.exp(-dt * 1.6));
        vPitch = lerp(vPitch, 0, 1 - Math.exp(-dt * 2.2));
        yaw += vYaw * dt;
        pitch += vPitch * dt;
        const rest = Math.atan2(Math.sin(BASE_PITCH - pitch), Math.cos(BASE_PITCH - pitch));
        pitch += rest * (1 - Math.exp(-dt * 0.35)); // drifts back to the resting tilt
      }

      const R = (Math.min(W, H) / 2) * (FIGMA_R / 380);
      const sc = R / FIGMA_R;
      const cx = W / 2;
      const cy = H / 2;
      const cy_ = Math.cos(yaw);
      const sy_ = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const x1 = n.x * cy_ + n.z * sy_;
        const z1 = -n.x * sy_ + n.z * cy_;
        const y2 = n.y * cp - z1 * sp;
        const z2 = n.y * sp + z1 * cp;
        const s = FOCAL / (FOCAL - z2);
        px[i] = cx + x1 * R * s;
        py[i] = cy + y2 * R * s;
        pz[i] = z2;
        ps[i] = s;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";

      // Edges, back to front
      for (let i = 0; i < edges.length; i++) edgeZ[i] = (pz[edges[i].a] + pz[edges[i].b]) / 2;
      edgeOrder.sort((i, j) => edgeZ[i] - edgeZ[j]);
      const tips: [number, number, number][] = [];
      for (const ei of edgeOrder) {
        const e = edges[ei];
        const k = ease(clamp((growth - e.start) / (e.end - e.start), 0, 1));
        if (k <= 0) continue;
        const z = edgeZ[ei];
        const depthA = z < 0 ? lerp(0.15, 0.27, z + 1) : lerp(0.27, 0.5, z);
        const lit = hover >= 0 && (logos[hover].node === e.a || logos[hover].node === e.b);
        const w = (lerp(2.1, 0.9, (e.gen - 1) / (MAX_GEN - 1)) * lerp(0.8, 1.15, (z + 1) / 2) + (lit ? 0.9 : 0)) * Math.max(0.7, sc);
        const x0 = px[e.a];
        const y0 = py[e.a];
        const x1 = lerp(x0, px[e.b], k);
        const y1 = lerp(y0, py[e.b], k);
        ctx.strokeStyle = rgba(fg, lit ? 0.9 : depthA);
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        if (k < 1 && !e.cross) tips.push([x1, y1, ps[e.b]]);
      }

      // Dot nodes, back to front
      nodeOrder.sort((i, j) => pz[i] - pz[j]);
      for (const i of nodeOrder) {
        const n = nodes[i];
        const a = ease(clamp((growth - (n.appear - 0.18)) / 0.18, 0, 1));
        if (a <= 0 || i === 0) continue;
        const depth = (pz[i] + 1) / 2;
        let pop = 0;
        if (n.logo >= 0) {
          const l = logos[n.logo];
          const start = GROW_END + (l.order * (1 - GROW_END - POP_DUR - 0.01)) / (logos.length - 1);
          pop = ease(clamp((p - start) / POP_DUR, 0, 1));
        }
        const r = (n.dot / 2) * sc * a * lerp(0.75, 1.15, depth) * (1 - pop);
        if (r < 0.2) continue;
        ctx.fillStyle = rgba(fg, lerp(0.35, 1, depth) * Math.min(1, a * 1.4));
        ctx.beginPath();
        ctx.arc(px[i], py[i], r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Root: bright dot and two soft pulse rings
      for (let k = 0; k < 2; k++) {
        const phase = frozen ? 0.4 + k * 0.45 : (t * 0.45 + k * 0.5) % 1;
        ctx.strokeStyle = rgba(fg, 0.28 * (1 - phase));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px[0], py[0], lerp(9, 40, ease(phase)) * sc * ps[0], 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = rgba(fg, 1);
      ctx.beginPath();
      ctx.arc(px[0], py[0], 7 * sc * ps[0], 0, Math.PI * 2);
      ctx.fill();

      // Growth tips: a bright 5px dot with a soft glow leads each growing line
      for (const [x, y, s] of tips) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12 * sc * s);
        g.addColorStop(0, rgba(fg, 0.55));
        g.addColorStop(1, rgba(fg, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 12 * sc * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(fg, 1);
        ctx.beginPath();
        ctx.arc(x, y, 2.5 * sc, 0, Math.PI * 2);
        ctx.fill();
      }

      // Logo nodes, back to front
      const logoOrder = logos.map((_, i) => i).sort((i, j) => pz[logos[i].node] - pz[logos[j].node]);
      let tip: { x: number; y: number; r: number; name: string } | null = null;
      for (const li of logoOrder) {
        const l = logos[li];
        const i = l.node;
        const start = GROW_END + (l.order * (1 - GROW_END - POP_DUR - 0.01)) / (logos.length - 1);
        const pop = ease(clamp((p - start) / POP_DUR, 0, 1));
        hoverT[li] = lerp(hoverT[li], hover === li ? 1 : 0, 1 - Math.exp(-dt * 14));
        if (pop <= 0) continue;
        const depth = (pz[i] + 1) / 2;
        const r = (l.d / 2) * sc * lerp(0.6, 1, pop) * lerp(0.82, 1.1, depth) * ps[i] * (1 + 0.15 * hoverT[li]);
        const alpha = pop * lerp(0.45, 1, depth);
        ctx.fillStyle = rgba(bg, pop);
        ctx.beginPath();
        ctx.arc(px[i], py[i], r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(fg, Math.min(1, alpha * (0.9 + 0.3 * hoverT[li])));
        ctx.lineWidth = 1.5;
        ctx.stroke();
        const icon = l.icon ? iconFor(l.icon) : null;
        if (icon) {
          const side = r * 1.05;
          ctx.globalAlpha = alpha;
          ctx.drawImage(icon, px[i] - side / 2, py[i] - side / 2, side, side);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = rgba(fg, alpha);
          ctx.font = `500 ${Math.max(7, r * 0.5)}px ${family}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.letterSpacing = `${r * 0.04}px`;
          ctx.fillText(l.label, px[i] + r * 0.02, py[i] + r * 0.04);
        }
        if (hover === li) tip = { x: px[i], y: py[i], r, name: l.name };
      }
      ctx.letterSpacing = "0px";

      // Hover label (tech name)
      if (tip) {
        const text = tip.name.toUpperCase();
        ctx.font = `500 12px ${family}`;
        ctx.letterSpacing = "2px";
        const tw = ctx.measureText(text).width;
        const bx = Math.min(W - tw / 2 - 18, Math.max(tw / 2 + 18, tip.x));
        const by = Math.max(18, tip.y - tip.r - 22);
        ctx.fillStyle = rgba(bg, 0.92);
        ctx.strokeStyle = rgba(fg, 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx - tw / 2 - 12, by - 13, tw + 24, 26, 13);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = rgba(fg, 1);
        ctx.fillText(text, bx + 1, by + 1);
        ctx.letterSpacing = "0px";
      }
    };

    // ---- interaction (only once the network is complete) ----
    const logoAt = (x: number, y: number) => {
      let found = -1;
      let best = Infinity;
      const sc = (Math.min(W, H) / 2) * (FIGMA_R / 380) / FIGMA_R;
      logos.forEach((l, li) => {
        const i = l.node;
        const r = (l.d / 2) * sc * ps[i] * lerp(0.82, 1.1, (pz[i] + 1) / 2);
        if (pz[i] < -0.35) return; // round the back: not hoverable
        const d = Math.hypot(x - px[i], y - py[i]);
        if (d <= r + 4 && pz[i] - d * 0.001 < best) {
          best = -pz[i];
          found = li;
        }
      });
      return found;
    };
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const down = (e: PointerEvent) => {
      if (!interactive) return;
      dragging = true;
      [lastX, lastY] = local(e);
      vYaw = 0;
      vPitch = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!interactive) return;
      const [x, y] = local(e);
      if (dragging) {
        const dx = x - lastX;
        const dy = y - lastY;
        lastX = x;
        lastY = y;
        yaw += dx * 0.008;
        pitch += dy * 0.008;
        vYaw = lerp(vYaw, (dx * 0.008) / 0.016, 0.5);
        vPitch = lerp(vPitch, (dy * 0.008) / 0.016, 0.5);
      } else {
        hover = logoAt(x, y);
        canvas.style.cursor = hover >= 0 ? "pointer" : "grab";
      }
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
    };
    const leave = () => {
      if (!dragging) hover = -1;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);

    // ---- lifecycle ----
    let frame = 0;
    let inView = true;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (inView) draw(now);
    };
    const redraw = () => {
      size();
      readTokens();
      draw(performance.now());
    };
    redraw();
    document.fonts.ready.then(() => frozen && redraw());
    const ro = new ResizeObserver(redraw);
    ro.observe(wrap);
    const mo = new MutationObserver(() => {
      readTokens();
      if (frozen) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    let io: IntersectionObserver | null = null;
    if (!frozen) {
      io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: "100px" });
      io.observe(wrap);
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      io?.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [net, progress]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="font-display absolute inset-0 size-full touch-pan-y select-none"
        style={{ pointerEvents: "none" }}
      />
      <ul className="sr-only">
        {net.logos.map((l) => (
          <li key={l.label}>{l.name}</li>
        ))}
      </ul>
    </div>
  );
}
