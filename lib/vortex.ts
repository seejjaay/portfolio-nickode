/* Suck-and-puke motion for the Achievements section. A "mouth" (the See all
   button) swallows a set of cards, each one spiralling into it and shrinking away,
   then spits out another set from the same spot, each flying to its own place.

   The real cards never move. Each on-screen card gets a stand-in copy in an
   overlay laid over the page (in page coordinates, so it scrolls with the page),
   the real card is hidden while its copy flies, and it is shown again the moment
   its copy lands. Animating the real cards instead is what went wrong: the
   marquee track is drawn as one wide layer, and once a card's own animation
   ended Chrome sometimes never redrew it into that layer, leaving a blank strip
   until something scrolled in from the edge. Hiding and showing a card is an
   ordinary style change, which is always repainted.

   Only transform and opacity animate. Cards in the faint depth row are left
   out (their copy would lose the row's blur and fade). Callers skip all of this
   under reduced motion. */

type Item = { el: HTMLElement; r: DOMRect; dx: number; dy: number; dist: number };

let overlay: HTMLElement | null = null;
function layer() {
  if (!overlay || !overlay.isConnected) {
    overlay = document.createElement("div");
    overlay.className = "vortex-layer";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }
  return overlay;
}

const onScreen = (r: DOMRect) =>
  r.bottom > -60 && r.top < window.innerHeight + 60 && r.right > -60 && r.left < window.innerWidth + 60;

/* Where each on-screen card is, relative to the mouth. Measured in one pass. */
function measure(cards: HTMLElement[], mouth: HTMLElement): Item[] {
  const m = mouth.getBoundingClientRect();
  const mx = m.left + m.width / 2;
  const my = m.top + m.height / 2;
  const items: Item[] = [];
  for (const el of cards) {
    if (el.closest(".achv-depth")) continue;
    const r = el.getBoundingClientRect();
    if (!onScreen(r) || r.width === 0) continue;
    const dx = mx - (r.left + r.width / 2);
    const dy = my - (r.top + r.height / 2);
    items.push({ el, r, dx, dy, dist: Math.hypot(dx, dy) });
  }
  return items;
}

/* A stand-in copy of a card, placed exactly over it, in page coordinates. */
function ghost({ el, r }: Item) {
  const g = el.cloneNode(true) as HTMLElement;
  g.removeAttribute("id");
  g.inert = true;
  Object.assign(g.style, {
    position: "absolute",
    left: `${r.left + window.scrollX}px`,
    top: `${r.top + window.scrollY}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    margin: "0",
    listStyle: "none",
  });
  layer().appendChild(g);
  return g;
}

const settle = (a: Animation) => a.finished.then(() => undefined, () => undefined);

/** Puts every card back on show and removes any copies still in flight. */
export function clearVortex(cards: HTMLElement[]) {
  for (const el of cards) el.style.visibility = "";
  overlay?.replaceChildren();
}

/** Every on-screen card spirals into the mouth, nearest first, and is gone.
 *  The real cards stay hidden afterwards (the caller swaps the layout away). */
export function suck(cards: HTMLElement[], mouth: HTMLElement): Promise<void> {
  const items = measure(cards, mouth);
  const far = Math.max(1, ...items.map((i) => i.dist));
  return Promise.all(
    items.map((item) => {
      const { el, dx, dy, dist } = item;
      const g = ghost(item);
      el.style.visibility = "hidden";
      const spin = (dx < 0 ? -1 : 1) * (50 + Math.random() * 90);
      const a = g.animate(
        [
          { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1, offset: 0 },
          { transform: `translate(${dx * 0.3}px, ${dy * 0.3}px) scale(0.82) rotate(${spin * 0.35}deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.04) rotate(${spin}deg)`, opacity: 0, offset: 1 },
        ],
        {
          duration: 560,
          delay: (dist / far) * 300 + Math.random() * 60,
          easing: "cubic-bezier(0.55, 0, 0.85, 0.35)", // slow at first, then yanked in
          fill: "forwards",
        },
      );
      return settle(a).then(() => g.remove());
    }),
  ).then(() => undefined);
}

/** The mouth spits the cards out: each copy flies from it to its card's place,
 *  with a little overshoot, and the real card appears as its copy lands.
 *  `order` is "sequence" (list order, for a grid) or "distance" (nearest the
 *  mouth first, for the marquee). */
export function puke(cards: HTMLElement[], mouth: HTMLElement, order: "sequence" | "distance"): Promise<void> {
  const items = measure(cards, mouth);
  if (order === "distance") items.sort((a, b) => a.dist - b.dist);
  const far = Math.max(1, ...items.map((i) => i.dist));
  return Promise.all(
    items.map((item, i) => {
      const { el, dx, dy, dist } = item;
      const g = ghost(item);
      el.style.visibility = "hidden";
      const spin = (dx < 0 ? 1 : -1) * (40 + Math.random() * 80);
      const a = g.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(0.04) rotate(${spin}deg)`, opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.22 },
          { transform: "translate(0px, 0px) scale(1) rotate(0deg)", opacity: 1, offset: 1 },
        ],
        {
          duration: 720,
          delay: order === "sequence" ? i * 34 : (dist / far) * 320,
          easing: "cubic-bezier(0.2, 0.9, 0.25, 1.12)", // shoots out and settles with one small overshoot
          fill: "both",
        },
      );
      return settle(a).then(() => {
        el.style.visibility = "";
        g.remove();
      });
    }),
  ).then(() => undefined);
}

/** The mouth's own reaction: a gulp while it swallows, a burp while it spits. */
export function squish(mouth: HTMLElement, kind: "gulp" | "burp") {
  const ring = (px: number, alpha: number) => `0 0 0 ${px}px color-mix(in srgb, var(--text) ${alpha}%, transparent)`;
  const frames =
    kind === "gulp"
      ? [
          { transform: "scale(1)", boxShadow: ring(0, 0) },
          { transform: "scale(1.12)", boxShadow: ring(10, 14), offset: 0.3 },
          { transform: "scale(0.96)", boxShadow: ring(4, 8), offset: 0.55 },
          { transform: "scale(1.16)", boxShadow: ring(16, 14), offset: 0.8 },
          { transform: "scale(1)", boxShadow: ring(0, 0) },
        ]
      : [
          { transform: "scale(1)", boxShadow: ring(0, 0) },
          { transform: "scale(0.9)", boxShadow: ring(0, 0), offset: 0.2 },
          { transform: "scale(1.2)", boxShadow: ring(22, 16), offset: 0.5 },
          { transform: "scale(0.97)", boxShadow: ring(8, 6), offset: 0.75 },
          { transform: "scale(1)", boxShadow: ring(0, 0) },
        ];
  mouth.animate(frames, { duration: kind === "gulp" ? 820 : 700, easing: "ease-in-out" });
}
