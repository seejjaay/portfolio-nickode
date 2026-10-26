"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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

export function Nav() {
  const onHome = usePathname() === "/";
  const active = useActiveSection(onHome);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-[var(--nav-h)] items-center justify-between border-b border-border px-12 backdrop-blur-md">
      <Link
        href="/"
        className="font-display text-[20px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-text"
      >
        NICK.ODE
      </Link>

      <div className="flex items-center gap-8">
        <nav aria-label="Primary">
          <ul className="flex items-start gap-10">
            {links.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <Link
                    href={`/#${id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={`flex flex-col items-center gap-[6px] whitespace-nowrap font-display text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] transition-colors duration-300 ${
                      isActive ? "text-text" : "text-text-2 hover:text-text"
                    }`}
                  >
                    {label}
                    {/* Underline slot is always rendered so the row height never shifts. */}
                    <span
                      aria-hidden
                      className={`h-px w-6 bg-text transition-transform duration-300 ease-brand motion-reduce:transition-none ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
