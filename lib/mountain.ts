import { clamp, mulberry32, smoothstep } from "@/lib/motion";

/* Mountain dust (DESIGN.md 7.7). The ink illustration (2400x1500) is sampled at
   a 720x450 working grid on an offscreen canvas; every ink pixel can become a
   speck with its own seeded delay, wind, lift and wobble. Scroll progress 0 to 1
   drives them all: peaks go first, then slopes, then the pines, blown right and
   up. From 0.40 a second, smaller cloud drifts in over the list's footprint and
   settles while the content fades in. One canvas, no DOM per speck.
   Everything below is in grid units (720 wide) and scales with the container. */
const SRC_W = 2400;
const SRC_H = 1500;
const GRID_W = 720;
const GRID_H = 450;
const INK_MIN = 0.1; // alpha a grid pixel needs to count as ink
const SOLID_MIN = 0.6; // alpha a grid pixel needs to count towards a solid mass
const ERODE = 2; // thin strokes die in the erosion, pine masses survive
const DILATE = 3; // and grow back to cover the boughs around the core
const KEEP = 0.55; // share of ink pixels that become specks
const BIG = 0.18; // share of specks drawn 2px
const SPAN = 0.55; // progress an outgoing speck takes to leave, after its delay
const SOLID_DELAY = 0.28; // pines and tree masses wait this much longer
const DUST_END = 0.85; // the last speck, outgoing or incoming, is gone here
const FADE_IN = 0.015; // specks take over from the sharp image over this much progress
const FADE_OUT = 0.045; // and the image is gone by here
const INCOMING = 1300;
const IN_START = 0.4;
const WOBBLE = 14;

export const ASPECT = SRC_W / SRC_H;

export type Rect = { x: number; y: number; w: number; h: number };

type Dust = {
  count: number;
  x: Uint16Array;
  y: Uint16Array;
  delay: Float32Array;
  dx: Float32Array;
  dy: Float32Array;
  phase: Float32Array;
  big: Uint8Array;
  alpha: Float32Array;
  end: number; // when the last speck has left, in the speck clock
};

/* Min (erode) or max (grow) over a (2r+1) square, as two 1-D passes. Outside the grid counts as empty. */
function morph(src: Uint8Array, r: number, grow: boolean) {
  const tmp = new Uint8Array(src.length);
  const out = new Uint8Array(src.length);
  const run = (from: Uint8Array, to: Uint8Array, horizontal: boolean) => {
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        let v = grow ? 0 : 1;
        for (let k = -r; k <= r; k++) {
          const xx = horizontal ? x + k : x;
          const yy = horizontal ? y : y + k;
          const s = xx < 0 || xx >= GRID_W || yy < 0 || yy >= GRID_H ? 0 : from[yy * GRID_W + xx];
          if (grow ? s > v : s < v) v = s;
        }
        to[y * GRID_W + x] = v;
      }
    }
  };
  run(src, tmp, true);
  run(tmp, out, false);
  return out;
}

function sample(image: HTMLImageElement): Dust {
  const off = document.createElement("canvas");
  off.width = GRID_W;
  off.height = GRID_H;
  const octx = off.getContext("2d", { willReadFrequently: true })!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(image, 0, 0, GRID_W, GRID_H);
  const px = octx.getImageData(0, 0, GRID_W, GRID_H).data;

  const a = new Uint8Array(GRID_W * GRID_H);
  const mass = new Uint8Array(GRID_W * GRID_H);
  let ink = 0;
  for (let i = 0; i < a.length; i++) {
    a[i] = px[i * 4 + 3];
    if (a[i] >= INK_MIN * 255) ink++;
    if (a[i] >= SOLID_MIN * 255) mass[i] = 1;
  }
  const solid = morph(morph(mass, ERODE, false), DILATE, true);

  const d: Dust = {
    count: 0,
    x: new Uint16Array(ink),
    y: new Uint16Array(ink),
    delay: new Float32Array(ink),
    dx: new Float32Array(ink),
    dy: new Float32Array(ink),
    phase: new Float32Array(ink),
    big: new Uint8Array(ink),
    alpha: new Float32Array(ink),
    end: 0,
  };
  const rand = mulberry32(0x6d6f756e);
  let n = 0;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const i = y * GRID_W + x;
      if (a[i] < INK_MIN * 255) continue;
      if (rand() >= KEEP) continue;
      d.x[n] = x;
      d.y[n] = y;
      d.delay[n] = 0.42 * (y / GRID_H) + 0.16 * rand() + (solid[i] ? SOLID_DELAY : 0);
      d.dx[n] = 150 + 330 * rand();
      d.dy[n] = 30 + 190 * rand();
      d.phase[n] = rand() * Math.PI * 2;
      d.big[n] = rand() < BIG ? 1 : 0;
      d.alpha[n] = clamp((a[i] / 255) * 1.8, 0.35, 1); // thin strokes sample faint; a speck is a solid dot
      if (d.delay[n] > d.end) d.end = d.delay[n];
      n++;
    }
  }
  d.count = n;
  d.end += SPAN;
  return d;
}

/* The incoming cloud: where each speck lands is a pair of 0..1 randoms, mapped onto
   the list's footprint every frame, so it follows the layout without being rebuilt. */
function incoming() {
  const rand = mulberry32(0x64757374);
  const n = INCOMING;
  const f = {
    pick: new Float32Array(n),
    u: new Float32Array(n),
    v: new Float32Array(n),
    start: new Float32Array(n),
    dur: new Float32Array(n),
    dx: new Float32Array(n),
    dy: new Float32Array(n),
    phase: new Float32Array(n),
    big: new Uint8Array(n),
    alpha: new Float32Array(n),
  };
  for (let i = 0; i < n; i++) {
    f.pick[i] = rand();
    f.u[i] = rand();
    f.v[i] = rand();
    f.start[i] = IN_START + 0.15 * rand();
    f.dur[i] = 0.25 + 0.05 * rand(); // start + dur never passes DUST_END
    f.dx[i] = 150 + 330 * rand();
    f.dy[i] = 30 + 190 * rand();
    f.phase[i] = rand() * Math.PI * 2;
    f.big[i] = rand() < BIG ? 1 : 0;
    f.alpha[i] = 0.5 + 0.5 * rand();
  }
  return f;
}

/* The grid the specks are written into, as packed RGBA, then blitted to the canvas. */
function gridBuffer() {
  const canvas = document.createElement("canvas");
  const g = {
    canvas,
    ctx: canvas.getContext("2d")!,
    w: 0,
    h: 0,
    image: null as unknown as ImageData,
    px: new Uint32Array(0),
    alloc(w: number, h: number) {
      g.w = canvas.width = w;
      g.h = canvas.height = h;
      g.image = g.ctx.createImageData(w, h);
      g.px = new Uint32Array(g.image.data.buffer);
    },
  };
  return g;
}

/* The theme's ink (--text) as 0x00BBGGRR; a canvas resolves whatever CSS color it is. */
function inkColor() {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#fff";
  x.fillRect(0, 0, 1, 1);
  const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
  return (b << 16) | (g << 8) | r;
}

export function createMountain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const cloud = incoming();
  const grid = gridBuffer();
  let image: HTMLImageElement | null = null;
  let dust: Dust | null = null;
  let packed = 0xffffff; // ink as 0x00BBGGRR, ready for the grid buffer
  let loadId = 0;
  let dpr = 1;
  let width = 0;
  let height = 0;
  let onChange = () => {};

  const api = {
    /** Called whenever the picture needs redrawing (image arrived, resized). */
    set onChange(fn: () => void) {
      onChange = fn;
    },

    /** The ink color follows the theme: white ink for dark, dark ink for light (no CSS invert). */
    load(theme: "dark" | "light") {
      const id = ++loadId;
      const next = new Image();
      next.decoding = "async";
      next.onload = () => {
        if (id !== loadId) return;
        image = next;
        dust = sample(next);
        packed = inkColor();
        onChange();
      };
      next.src = `/assets/mountain/mountain-ink-${theme === "light" ? "dark" : "white"}.png`;
    },

    resize(w: number, h: number) {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = w;
      height = h;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      onChange();
    },

    /** The illustration's box: full width, 16:10, bottom-aligned under the title (and nav). */
    box(topReserve: number) {
      const w = Math.min(width, Math.max(0, height - topReserve) * ASPECT);
      const h = w / ASPECT;
      return { x: (width - w) / 2, y: height - h, w, h };
    },

    /** `footprint` is where the list sits, in canvas px; the incoming dust only lands inside it. */
    draw(progress: number, topReserve: number, footprint: Rect[]) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!image || !dust || progress >= DUST_END) return;
      const b = api.box(topReserve);
      const s = b.w / GRID_W;

      // At rest it is the crisp illustration; the specks take over as soon as scrolling starts.
      const sharp = 1 - smoothstep(0, FADE_OUT, progress);
      if (sharp > 0) {
        ctx.globalAlpha = sharp;
        ctx.drawImage(image, b.x, b.y, b.w, b.h);
        ctx.globalAlpha = 1;
      }

      // Specks are written into a grid buffer (grid px = the 720-wide units, spanning the
      // whole canvas so dust can leave the illustration's box) and scaled up in one blit.
      const gw = Math.ceil(width / s) + 1;
      const gh = Math.ceil(height / s) + 1;
      if (gw !== grid.w || gh !== grid.h) grid.alloc(gw, gh);
      const px = grid.px;
      px.fill(0);
      const ox = Math.round(b.x / s);
      const oy = Math.round(b.y / s);
      const put = (alpha: number, gx: number, gy: number, big: number) => {
        const x0 = Math.round(gx);
        const y0 = Math.round(gy);
        const v = ((alpha * 255) << 24) | rgb;
        for (let yy = y0; yy <= y0 + big; yy++) {
          if (yy < 0 || yy >= gh) continue;
          for (let xx = x0; xx <= x0 + big; xx++) {
            if (xx < 0 || xx >= gw) continue;
            const k = yy * gw + xx;
            if (px[k] >>> 24 < alpha * 255) px[k] = v;
          }
        }
      };
      const rgb = packed;

      const lead = smoothstep(0, FADE_IN, progress);
      if (lead > 0) {
        // The speck clock is stretched so the last speck leaves exactly at DUST_END.
        const clock = (progress / DUST_END) * dust.end;
        for (let i = 0; i < dust.count; i++) {
          const t = (clock - dust.delay[i]) / SPAN;
          let alpha = dust.alpha[i] * lead;
          let x = dust.x[i];
          let y = dust.y[i];
          if (t > 0) {
            if (t >= 1) continue;
            const e = t * t * (3 - 2 * t);
            alpha *= Math.pow(1 - e, 1.1);
            if (alpha < 0.02) continue;
            x += dust.dx[i] * e;
            y += -dust.dy[i] * e + Math.sin(dust.phase[i] + e * 8) * WOBBLE * e;
          }
          put(alpha, ox + x, oy + y, dust.big[i]);
        }
      }

      // The incoming cloud: drifts in from the right and settles over the list.
      const area = footprint.reduce((sum, r) => sum + r.w * r.h, 0);
      if (progress > IN_START && area > 0) {
        for (let i = 0; i < INCOMING; i++) {
          const u = (progress - cloud.start[i]) / cloud.dur[i];
          if (u <= 0 || u >= 1) continue;
          const e = smoothstep(0, 0.7, u);
          const alpha = cloud.alpha[i] * smoothstep(0, 0.2, u) * (1 - smoothstep(0.65, 1, u));
          if (alpha < 0.02) continue;
          let at = cloud.pick[i] * area;
          let r = footprint[footprint.length - 1];
          for (const f of footprint) {
            if (at < f.w * f.h) {
              r = f;
              break;
            }
            at -= f.w * f.h;
          }
          const left = 1 - e;
          const gx = (r.x + cloud.u[i] * r.w) / s + cloud.dx[i] * left;
          const gy = (r.y + cloud.v[i] * r.h) / s + (cloud.dy[i] + Math.sin(cloud.phase[i] + e * 8) * WOBBLE) * left;
          put(alpha, gx, gy, cloud.big[i]);
        }
      }

      grid.ctx.putImageData(grid.image, 0, 0);
      ctx.imageSmoothingEnabled = false; // crisp grains, not blurred blobs
      ctx.drawImage(grid.canvas, 0, 0, gw, gh, 0, 0, gw * s, gh * s);
    },
  };
  return api;
}
