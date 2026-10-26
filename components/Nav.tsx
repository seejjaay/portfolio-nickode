"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useModalDialog } from "@/lib/useModalDialog";

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
   the links in a drawer from the right (a native <dialog>, like the modals, so
   focus is trapped, Esc closes and the page behind is locked). The theme toggle
   lives in the drawer. A link closes the drawer first and navigates once the
   page scroll lock is released, so the smooth scroller is running again. */
export function Nav() {
  const router = useRouter();
  const onHome = usePathname() === "/";
  const active = useActiveSection(onHome);
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useModalDialog(open, burgerRef);

  const go = (href: string) => {
    setOpen(false);
    window.setTimeout(() => router.push(href), 300);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[var(--nav-h)] items-center justify-between px-6 md:px-12">
        <Link
          href="/"
          className="nav-chip pointer-events-auto rounded-full px-5 py-2 font-display text-[18px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-text"
        >
          NICK.ODE
        </Link>
        <button
          ref={burgerRef}
          type="button"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="nav-chip pointer-events-auto flex size-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-full text-text"
        >
          <span aria-hidden className="h-px w-5 bg-current" />
          <span aria-hidden className="h-px w-5 bg-current" />
          <span aria-hidden className="h-px w-5 bg-current" />
        </button>
      </header>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className={`nav-dialog ${open ? "" : "is-closing"}`}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false); // the scrim
        }}
      >
        <div className="nav-panel flex h-full w-[440px] max-w-full flex-col border-l border-border-strong bg-bg px-10 pb-10 pt-6">
          <div className="flex h-11 shrink-0 items-center justify-between">
            <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
              Menu
            </p>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong text-text transition-colors duration-300 hover:border-text"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          <nav aria-label="Primary" className="mt-12 flex-1">
            <ul className="flex flex-col">
              {links.map(({ id, label }, i) => {
                const isActive = active === id;
                return (
                  <li key={id} className="border-b border-border">
                    <Link
                      href={`/#${id}`}
                      aria-current={isActive ? "location" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        go(`/#${id}`);
                      }}
                      className={`nav-link group flex items-baseline gap-5 py-5 font-display text-[26px] font-medium uppercase leading-[1.2] tracking-[0.06em] transition-colors duration-300 ${
                        isActive ? "text-text" : "text-text-2 hover:text-text"
                      }`}
                    >
                      <span className="w-6 shrink-0 text-[12px] font-normal tracking-[0.18em] text-text-muted">{pad(i)}</span>
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center justify-between pt-8">
            <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
              Theme
            </p>
            <ThemeToggle />
          </div>
        </div>
      </dialog>
    </>
  );
}
