"use client";

import { useEffect, useRef, useState } from "react";
import { ease } from "@/lib/motion";

/* A number that counts up from 0 the first time it scrolls into view
   (DESIGN.md 9.1). The server renders the final value, and an invisible copy of
   it holds the width, so nothing shifts while it counts and nothing is wrong
   without JS or under reduced motion. */
export function CountUp({ to, prefix = "", className }: { to: number; prefix?: string; className?: string }) {
  const format = (n: number) => prefix + n.toLocaleString("en-US");
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    let frame = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min(1, (now - start) / 1100);
          setShown(Math.round(to * ease(t)));
          if (t < 1) frame = requestAnimationFrame(run);
          else setShown(null);
        };
        setShown(0);
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <span className={shown === null ? "" : "invisible"}>{format(to)}</span>
      {shown !== null && (
        <span aria-hidden className="absolute inset-0 tabular-nums">
          {format(shown)}
        </span>
      )}
    </span>
  );
}
