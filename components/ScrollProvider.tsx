"use client";

import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { refreshScroll, scrollToSection, startSmoothScroll } from "@/lib/scroll";

export function ScrollProvider() {
  const pathname = usePathname();
  const arrived = useRef(false);

  useEffect(() => startSmoothScroll(), []);

  // Coming back to the home page from another one (the project page's back link,
  // or a menu link) with a #section: glide to it. Next's own hash scroll does not
  // fire when the home page is restored, and the first load needs nothing.
  useEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      return;
    }
    const id = window.location.hash.slice(1);
    if (pathname !== "/" || !id) return;
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
