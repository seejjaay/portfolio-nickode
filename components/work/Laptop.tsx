"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { SceneState } from "./laptop-motion";

/* The laptop (DESIGN.md 7.4, Figma 33:60 / 34:123). The model is three.js
   (LaptopScene, loaded only once the section is near); the screen content stays
   DOM and is projected onto the screen mesh with a CSS 3D camera that LaptopScene
   keeps in step with the WebGL one. Without WebGL the carousel just sits on a
   flat panel. */
const LaptopScene = dynamic(() => import("./LaptopScene"), { ssr: false });

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

export function Laptop({ progress, children }: { progress: RefObject<SceneState>; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false); // load the 3D chunk once the section is near
  const [near, setNear] = useState(false); // render frames only while it is
  const [on, setOn] = useState(false);
  const [flat, setFlat] = useState(false);

  const place = useCallback((camera: string, object: string, w: number, h: number) => {
    const cam = camRef.current!;
    cam.style.width = `${w}px`;
    cam.style.height = `${h}px`;
    cam.style.transform = camera;
    objRef.current!.style.transform = object;
  }, []);

  // Load the 3D scene as soon as the page is idle, not when the section arrives:
  // three.js, shader compiles and the reflections take a moment, and the carousel
  // waits for the laptop. Scrolling close first loads it straight away.
  useEffect(() => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      if (hasWebGL()) setMounted(true);
      else setFlat(true);
    };
    const idle = window.requestIdleCallback?.(start, { timeout: 2500 });
    const timer = idle === undefined ? window.setTimeout(start, 1200) : 0;
    const io = new IntersectionObserver(
      ([e]) => {
        setNear(e.isIntersecting);
        if (e.isIntersecting) start();
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(rootRef.current!);
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0">
      <div aria-hidden className="lp-gl" data-on={on || undefined}>
        {mounted && !flat && (
          <Boundary onError={() => setFlat(true)}>
            <LaptopScene
              progress={progress}
              place={place}
              active={near}
              onReady={() => setOn(true)}
            />
          </Boundary>
        )}
      </div>
      <div ref={viewRef} className="lp-css3d" data-flat={flat || undefined} data-ready={flat || on || undefined}>
        <div className="lp-css3d-view">
          <div ref={camRef} className="lp-css3d-cam">
            <div ref={objRef} className="lp-css3d-obj">
              <div data-layer className="lp-display">
                {children}
                <div aria-hidden className="lp-sheen" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
