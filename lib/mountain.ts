import grid from "@/content/mountain-tiles.json";
import { clamp, mulberry32, smoothstep } from "@/lib/motion";

/* Mountain disperse (DESIGN.md 7.7). The ink illustration (2400x1500) is cut
   into a 24x15 grid of 100px tiles; only the 221 tiles that contain ink are
   kept (found from the PNG alpha at build time). Scroll progress 0 to 1 drives
   every tile: a seeded random drift (up to 320px sideways, 260px up), rotation
   (up to 80 degrees) and fade, with the top peaks starting first, all done by
   progress 0.85. Drawn on a canvas, so 221 moving tiles stay one element. */
const SRC_W = grid.width;
const SRC_H = grid.height;
const TILE = grid.tile;
const MAX_DRIFT_X = 320; // px at the illustration's native size
const MAX_DRIFT_Y = 260;
const MAX_ROTATION = 80; // degrees
const END = 0.85; // every tile is gone by here
const BLEED = 0.75; // source px copied past each edge so tiles meet without hairline seams

type Tile = {
  sx: number; // source x
  sy: number;
  col: number; // grid position, 0..23 / 0..14
  row: number;
  dx: number; // drift at the native size
  dy: number;
  rot: number; // radians
  start: number; // progress where this tile begins to move
  span: number; // progress it takes to leave
};

const tiles: Tile[] = grid.tiles.map(([col, row], i) => {
  const rand = mulberry32(i * 7919 + 13);
  const start = (row / (grid.rows - 1)) * 0.18 + rand() * 0.04; // top rows first
  return {
    sx: col * TILE,
    sy: row * TILE,
    col,
    row,
    dx: (rand() * 2 - 1) * MAX_DRIFT_X,
    dy: -(0.25 + rand() * 0.75) * MAX_DRIFT_Y,
    rot: ((rand() * 2 - 1) * MAX_ROTATION * Math.PI) / 180,
    start,
    span: Math.min(0.5 + rand() * 0.13, END - start),
  };
});

export const ASPECT = SRC_W / SRC_H;

export function createMountain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  let image: HTMLImageElement | null = null;
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

    draw(progress: number, topReserve: number) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!image || progress >= END) return;
      const b = api.box(topReserve);
      const scale = b.w / SRC_W;
      const ds = TILE * scale;

      if (progress <= 0) {
        ctx.drawImage(image, b.x, b.y, b.w, b.h); // at rest: one clean image, no tile seams
        return;
      }

      for (const t of tiles) {
        const u = clamp((progress - t.start) / t.span, 0, 1);
        const e = Math.pow(u, 1.5); // tiles accelerate away
        const alpha = 1 - smoothstep(0.3, 1, u);
        if (alpha <= 0.004) continue;
        const cx = b.x + (t.col + 0.5) * ds + t.dx * scale * e;
        const cy = b.y + (t.row + 0.5) * ds + t.dy * scale * e;
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(t.rot * e);
        const bleed = BLEED * scale;
        ctx.drawImage(
          image,
          t.sx - BLEED, t.sy - BLEED, TILE + BLEED * 2, TILE + BLEED * 2,
          -ds / 2 - bleed, -ds / 2 - bleed, ds + bleed * 2, ds + bleed * 2,
        );
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx.globalAlpha = 1;
    },
  };
  return api;
}
