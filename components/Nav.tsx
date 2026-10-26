"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { gsap, scrollToSection, scrollToY } from "@/lib/scroll";

const links = [
  { id: "about", label: "ABOUT" },
  { id: "work", label: "WHAT I'VE DONE" },
  { id: "stack", label: "WHAT I USE" },
  { id: "achievements", label: "WHAT I HAVE ACHIEVED" },
  { id: "experience", label: "WHERE I'VE BEEN SO FAR" },
  { id: "contact", label: "CONTACT" },
] as const;

/* Active link follows scroll: the last section whose top has crossed the
   probe line. About is active until a later section takes over, as in Figma. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>(links[0].id);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = window.innerHeight * 0.4;
      let current: string = links[0].id;
      for (const { id } of links) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= probe) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  return enabled ? active : null;
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

/* No nav bar: just the logo and a burger floating over the page. The burger opens
   the links in a drawer from the right and turns into the close button in place.
   The page stays scrollable underneath (nothing is locked), so the drawer is a
   plain panel rather than a modal: Esc, the scrim or a link closes it.

   All the motion is one paused GSAP timeline, played forwards to open and
   reversed (a little faster) to close: burger morph, scrim, panel slide, links
   rising in turn with their rules drawing, then the footer. Under reduced
   motion the same timeline just runs near-instantly. */
export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  // On a project page the Projects link is the active one (Figma 15:2).
  const active = useActiveSection(onHome) ?? (pathname.startsWith("/projects/") ? "work" : null);
  const [open, setOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = headerRef.current!;
    const drawer = drawerRef.current!;
    const burger = burgerRef.current!;
    const q = gsap.utils.selector(drawer);
    let stopWaiting = () => {};

    const ctx = gsap.context(() => {
      const [top, mid, bottom] = burger.querySelectorAll("span");
      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onReverseComplete: () => gsap.set(drawer, { visibility: "hidden" }),
      });
      timeline
        .set(drawer, { visibility: "visible" }, 0)
        .fromTo(q("[data-scrim]"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0)
        .fromTo(q("[data-panel]"), { xPercent: 100 }, { xPercent: 0, duration: 0.75, ease: "expo.out" }, 0)
        .fromTo(top, { y: 0, rotate: 0 }, { y: 6, rotate: 45, duration: 0.5, ease: "power3.inOut" }, 0)
        .fromTo(mid, { scaleX: 1, opacity: 1 }, { scaleX: 0, opacity: 0, duration: 0.25, ease: "power2.in" }, 0)
        .fromTo(bottom, { y: 0, rotate: 0 }, { y: -6, rotate: -45, duration: 0.5, ease: "power3.inOut" }, 0)
        .fromTo(q("[data-label]"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2)
        .fromTo(q("[data-item]"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07 }, 0.18)
        .fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.07, ease: "expo.out" }, 0.2)
        .fromTo(q("[data-foot]"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.55);
      tl.current = timeline;

      // The logo and burger settle in on load, or after the intro's handoff.
      if (!reduced.current) {
        const settle = () =>
          gsap.from(header.children, { y: -18, opacity: 0, duration: 0.9, stagger: 0.1, delay: 0.3, ease: "power3.out", clearProps: "transform,opacity" });
        if (document.documentElement.hasAttribute("data-intro")) {
          gsap.set(header.children, { opacity: 0 });
          window.addEventListener("intro-complete", settle, { once: true });
          stopWaiting = () => window.removeEventListener("intro-complete", settle);
        } else settle();
      }
    });
    return () => {
      stopWaiting();
      ctx.revert();
      tl.current = null;
    };
  }, []);

  // Drive the timeline from `open`: forwards to open, a bit quicker back to close.
  useEffect(() => {
    const timeline = tl.current;
    if (!timeline) return;
    const speed = reduced.current ? 60 : 1;
    if (open) {
      timeline.timeScale(speed).play();
      const focus = window.setTimeout(
        () => drawerRef.current?.querySelector<HTMLElement>("[data-item] a")?.focus({ preventScroll: true }),
        reduced.current ? 0 : 450,
      );
      return () => window.clearTimeout(focus);
    }
    timeline.timeScale(speed * 1.6).reverse();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      burgerRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header ref={headerRef} className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[var(--nav-h)] items-center justify-between px-6 md:px-12">
        <Link
          href="/"
          onClick={(e) => {
            setOpen(false);
            if (!onHome) return;
            e.preventDefault();
            scrollToY(0);
            history.replaceState(null, "", "/");
          }}
          className="nav-chip pointer-events-auto rounded-full px-5 py-2 font-display text-[18px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-text"
        >
          NICK.ODE
        </Link>
        <button
          ref={burgerRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nav-drawer"
          onClick={() => setOpen((v) => !v)}
          className="nav-chip pointer-events-auto flex size-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full text-text"
        >
          <span aria-hidden className="h-px w-5 bg-current" />
          <span aria-hidden className="h-px w-5 bg-current" />
          <span aria-hidden className="h-px w-5 bg-current" />
        </button>
      </header>

      {/* Hidden until the timeline plays (visibility keeps it out of the tab order). */}
      <div id="nav-drawer" ref={drawerRef} className="invisible fixed inset-0 z-40 overflow-hidden">
        <div data-scrim onClick={() => setOpen(false)} className="nav-scrim absolute inset-0" />
        <div data-panel className="absolute right-0 top-0 flex h-full w-[440px] max-w-full flex-col border-l border-border-strong bg-bg px-10 pb-10">
          <div className="flex h-[var(--nav-h)] shrink-0 items-center">
            <p data-label className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
              Menu
            </p>
          </div>

          <nav aria-label="Primary" className="mt-10 flex-1 overflow-y-auto">
            <ul className="flex flex-col">
              {links.map(({ id, label }, i) => {
                const isActive = active === id;
                return (
                  <li key={id} data-item className="relative">
                    <Link
                      href={`/#${id}`}
                      aria-current={isActive ? "location" : undefined}
                      onClick={(e) => {
                        setOpen(false);
                        // On the home page, travel there instead of jumping; elsewhere let Next navigate.
                        if (onHome && scrollToSection(id)) {
                          e.preventDefault();
                          history.replaceState(null, "", `/#${id}`);
                        }
                      }}
                      className={`nav-link flex items-baseline gap-5 py-5 font-display text-[26px] font-medium uppercase leading-[1.2] tracking-[0.06em] transition-colors duration-300 ${
                        isActive ? "text-text" : "text-text-2 hover:text-text"
                      }`}
                    >
                      <span className="w-6 shrink-0 text-[12px] font-normal tracking-[0.18em] text-text-muted">{pad(i)}</span>
                      <span className="nav-link-label">{label}</span>
                    </Link>
                    <span aria-hidden data-rule className="absolute bottom-0 left-0 h-px w-full origin-left bg-border" />
                  </li>
                );
              })}
            </ul>
          </nav>

          <div data-foot className="flex shrink-0 items-center justify-between pt-8">
            <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
              Theme
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
