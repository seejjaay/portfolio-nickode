"use client";

import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { refreshScroll, scrollToSection, scrollToTopNow, startSmoothScroll } from "@/lib/scroll";

export function ScrollProvider() {
  const pathname = usePathname();
  const arrived = useRef(false);

  useEffect(() => startSmoothScroll(), []);

  // Changing page. With a #section on the home page (the project page's back
  // link, or a menu link) glide to it; anything else starts at the top. Next's
  // own hash scroll does not fire when the home page is restored, and the first
  // load needs nothing (the head script in lib/scroll.ts handles reloads).
  useEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      return;
    }
    const id = window.location.hash.slice(1);
    // Any other page (a project, or home without a #section) starts at the very
    // top. Twice: once now, and once the new page has laid out, so the smooth
    // scroller cannot carry the old page's position over.
    if (pathname !== "/" || !id) {
      scrollToTopNow();
      const raf = requestAnimationFrame(() => {
        refreshScroll();
        scrollToTopNow();
      });
      return () => cancelAnimationFrame(raf);
    }
    // The restored page can still be hidden for a moment: wait until it has a layout.
    let timer = 0;
    let tries = 0;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el && el.offsetHeight > 0) {
        refreshScroll(); // re-measure first: the scroller still has the other page's height
        scrollToSection(id);
      }
      else if (tries++ < 40) timer = window.setTimeout(attempt, 50);
    };
    timer = window.setTimeout(attempt, 60);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
