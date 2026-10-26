import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

let lenisInstance: Lenis | null = null;

let locks = 0;

/* Freezes page scroll while a modal is open (Lenis stopped, native scroll off).
   Counted, so stacked modals keep the page locked until the last one closes.
   Returns an idempotent release function. */
export function lockScroll(): () => void {
  locks += 1;
  if (locks === 1) {
    document.documentElement.classList.add("modal-open");
    lenisInstance?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      document.documentElement.classList.remove("modal-open");
      lenisInstance?.start();
    }
  };
}

/** Smooth-scrolls the page (Lenis when running, native otherwise). */
export function scrollToY(y: number) {
  if (lenisInstance) lenisInstance.scrollTo(y, { duration: 1 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/* How far past the About pin the visitor has scrolled, 0 to 1. The About scene
   writes it every frame and the dot portrait reads it (no React state, so
   nothing re-renders while scrolling). */
export const aboutScroll = { value: 0 };

/* Lenis smooth scroll driven by GSAP's ticker, so ScrollTrigger scenes and
   scrolling share one clock. Skipped under reduced motion (native scroll). */
export function startSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const lenis = new Lenis();
  lenisInstance = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Pin lengths depend on font metrics, so measure again once fonts are in.
  document.fonts.ready.then(() => ScrollTrigger.refresh());

  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenisInstance = null;
  };
}
