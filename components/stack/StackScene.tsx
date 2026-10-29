"use client";

import { useEffect, useRef, useState } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { clamp, smoothstep } from "@/lib/motion";
import { NetworkCanvas } from "./NetworkCanvas";
import { NetworkModal } from "./NetworkModal";

/* What I use scene (DESIGN.md 7.5, Figma 3:27 / storyboard 37:203). Pinned for
   300vh; scroll progress drives the network's growth (NetworkCanvas). The big
   title sits dim behind the sphere; "drag to rotate" and the expand button arrive
   with the logos. Once the network is complete it stays complete when you scroll
   back up. Under reduced motion there is no pin and the finished network is shown. */
const PIN_VH = 3;
const LABEL = "Network of the technologies I use, grown from a single node; drag to rotate";

export function StackScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const progress = useRef({ p: 0 });
  const expandRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      progress.current.p = 1;
      return;
    }
    const track = trackRef.current!;
    const hint = hintRef.current!;
    let frame = 0;
    let inView = true;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: "200px" });
    io.observe(track);
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!inView) return;
      const raw = clamp(-track.getBoundingClientRect().top / (window.innerHeight * PIN_VH), 0, 1);
      if (raw >= 0.999) {
        // Fully grown: it stays grown, scrolling back up included, so the loop ends here.
        progress.current.p = 1;
        hint.style.opacity = "1";
        hint.removeAttribute("inert");
        cancelAnimationFrame(frame); // nothing left to drive
        return;
      }
      const p = raw;
      progress.current.p = p;
      const shown = smoothstep(0.9, 1, p);
      hint.style.opacity = String(shown);
      hint.toggleAttribute("inert", shown < 0.5);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={trackRef} className="nw-track">
      <div className="nw-stage">
        <p aria-hidden className="nw-backdrop">
          WHAT I USE
        </p>
        <NetworkCanvas progress={progress} label={LABEL} className="nw-net" />
        <div ref={hintRef} className="nw-ui">
          <p className="nw-hint">
            DRAG TO ROTATE<span className="nw-hint-touch"> · TAP A LOGO</span>
          </p>
          <button
            ref={expandRef}
            type="button"
            aria-label="Expand the network"
            aria-haspopup="dialog"
            onClick={() => setExpanded(true)}
            className="nw-expand"
          >
            <MaskIcon name="expand" width={20} />
          </button>
        </div>
      </div>
      <NetworkModal open={expanded} triggerRef={expandRef} onClose={() => setExpanded(false)} label={LABEL} />
    </div>
  );
}
