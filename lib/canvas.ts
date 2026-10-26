export type Rgb = [number, number, number];

/* Reads a color token (e.g. "--text") and lets the canvas normalise it, so the
   token can be any CSS color. Canvas drawing follows the theme through this. */
export function readTokenRgb(ctx: CanvasRenderingContext2D, token: string): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  ctx.fillStyle = "#fff";
  ctx.fillStyle = raw;
  const n = ctx.fillStyle;
  if (n.startsWith("#")) {
    return [1, 3, 5].map((i) => parseInt(n.slice(i, i + 2), 16)) as Rgb;
  }
  const m = n.match(/[\d.]+/g);
  return m ? ([+m[0], +m[1], +m[2]] as Rgb) : [255, 255, 255];
}
