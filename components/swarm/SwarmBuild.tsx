"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { startSwarm } from "@/lib/swarm";

/* A section that builds itself with a swarm of cursors as it scrolls into view
   (lib/swarm.ts). Mark each block to build with data-swarm-target. Under reduced
   motion nothing is hidden and nothing animates: the section is just there. */
export function SwarmBuild({ id, className = "", children }: { id: string; className?: string; children: ReactNode }) {
  const hostRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = hostRef.current!;
    const targets = [...host.querySelectorAll<HTMLElement>("[data-swarm-target]")];
    return startSwarm(layerRef.current!, host, targets);
  }, []);

  return (
    <section id={id} ref={hostRef} className={`relative ${className}`}>
      {children}
      <div ref={layerRef} aria-hidden className="swarm-layer" />
    </section>
  );
}
