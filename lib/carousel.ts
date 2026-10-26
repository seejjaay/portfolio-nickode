import { clamp } from "@/lib/motion";

/* Project carousel layout (DESIGN.md 7.4, Figma 33:94 / 33:74). All cards share
   one centre; a card at distance d from the current position sits d * SPACING
   to the side, shrinks from the 600px centre card to the 440px neighbours
   (0.733) and dims. `position` is fractional, so scrolling can scrub it. */
export const CARD = { w: 600, h: 370 };
export const SPACING = 460;
export const NEIGHBOUR_SCALE = 440 / 600;
const MAX_DIM = 0.38;

export function applyPosition(cards: HTMLElement[], position: number) {
  cards.forEach((card, i) => {
    const d = i - position;
    const a = Math.min(Math.abs(d), 1);
    const scale = 1 - (1 - NEIGHBOUR_SCALE) * a;
    const far = Math.abs(d) > 2.2;
    card.style.transform = `translate3d(${d * SPACING}px, 0, 0) scale(${scale})`;
    card.style.zIndex = String(10 - Math.round(Math.abs(d) * 2));
    card.style.visibility = far ? "hidden" : "visible";
    card.style.setProperty("--dim", String(MAX_DIM * a));
    card.style.setProperty("--detail", String(1 - a)); // index and VIEW PROJECT only on the centred card
    card.dataset.active = String(Math.abs(d) < 0.5);
  });
}

/** Scroll progress inside the carousel phase -> card position. */
export const positionAt = (phase: number, count: number) => clamp(phase, 0, 1) * (count - 1);
