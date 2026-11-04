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

/** Smooth-scrolls the page (Lenis when running, native otherwise). Longer trips
 *  take a little longer, so a jump across the whole page reads as travel rather
 *  than a blur. Under reduced motion it just goes there. */
export function scrollToY(y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo({ top: y, behavior: "auto" });
    return;
  }
  const duration = Math.min(2.4, 1 + Math.abs(y - window.scrollY) / 8000);
  if (lenisInstance) lenisInstance.scrollTo(y, { duration });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/* Runs in <head> before first paint. The browser never restores an old scroll
   position, and a reload (F5, pull-to-refresh) always starts at the very top:
   a #hash left in the URL is dropped so it cannot jump the page either. A fresh
   visit to a #section link still lands on that section. */
export const scrollInitScript = `(function(){try{if("scrollRestoration" in history)history.scrollRestoration="manual";var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"){if(location.hash)history.replaceState(history.state,"",location.pathname+location.search);window.scrollTo(0,0);}}catch(e){}})();`;

/** Jumps to the top at once (no glide), for a new page. */
export function scrollToTopNow() {
  lenisInstance?.resize();
  if (lenisInstance) lenisInstance.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

/** Moves the scroll position by dy at once. Used when content above the
 *  viewport changes height, to keep what is on screen exactly where it is. */
export function jumpScrollBy(dy: number) {
  lenisInstance?.resize();
  const y = Math.max(0, window.scrollY + dy);
  if (lenisInstance) lenisInstance.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/** True while the page is still moving (a wheel glide, a smooth scroll to a
 *  section, or a native touch fling). */
export function isScrolling() {
  return Boolean(lenisInstance?.isScrolling);
}

/** Collapses the scroll spacer of a CSS-sticky pinned scene once it has finished
 *  playing, so scrolling past it (up or down) costs one screen instead of
 *  several. The page is moved by exactly the height that went away, so nothing
 *  on screen moves. Call it only while the page is at rest (see isScrolling):
 *  a glide to a lower section would otherwise land short. */
export function collapsePin(track: HTMLElement, stage: HTMLElement) {
  if (track.classList.contains("is-played")) return;
  const before = stage.getBoundingClientRect().top;
  track.classList.add("is-played");
  jumpScrollBy(stage.getBoundingClientRect().top - before);
  refreshScroll();
}

/** Re-measures the page for the smooth scroller and the pinned scenes: call after
 *  the page's size changed under them (a restored route, for example). */
export function refreshScroll() {
  lenisInstance?.resize();
  ScrollTrigger.refresh();
}

/** Smooth-scrolls to a section by id, landing where a native anchor would
 *  (honouring its scroll-margin-top). False if there is no such element. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  scrollToY(Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin));
  return true;
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
