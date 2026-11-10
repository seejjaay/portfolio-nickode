"use client";

import { useEffect } from "react";

/* Scroll reveal for the inner pages (DESIGN.md 9.1). Renders nothing: mount it
   once at the end of a page and it adds `is-in` to every [data-reveal] element
   as it scrolls into view (the CSS does the motion). Elements already scrolled
   past (a restored scroll position) are revealed straight away. Without JS or
   under reduced motion the CSS shows everything. */
export function Reveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
