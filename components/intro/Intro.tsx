"use client";

import { useEffect, useRef } from "react";
import { INTRO_KEY } from "@/lib/intro";
import { cubicBezier, lerp, mulberry32 } from "@/lib/motion";
import { gsap, lockScroll } from "@/lib/scroll";

/* Intro (DESIGN.md 6): the NICK.ODE wordmark builds itself letter by letter over
   about 3 seconds (each letter starts before the last one lands), then flashes
   into the hero. Once per visit, skippable.

   The letters are laid out from the hero's own <h1>: each letter's x comes from a
   Range over the h1's text (so kerning is included) and each one gets the h1's
   exact font, size and line box, so the letters that land are the hero's letters,
   pixel for pixel. Everything is one paused GSAP timeline with a label at each
   letter's start time, so it can be scrubbed and tested. */
const T = { N: 0, I: 0.2, C: 0.4, K: 0.6, O: 0.8, D: 1.0, E: 1.2, DOT: 1.9, SLAM: 2.3, FLASH: 2.4, HANDOFF: 2.55, END: 3.0 };

const css = (el: HTMLElement, s: Partial<CSSStyleDeclaration> | Record<string, string>) => Object.assign(el.style, s);
const make = (parent: HTMLElement, s: Record<string, string> = {}, tag = "div") => {
  const el = document.createElement(tag);
  css(el, s);
  parent.appendChild(el);
  return el;
};

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current!;
    if (!html.hasAttribute("data-intro")) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const release = lockScroll();
    const inertEls = [...document.querySelectorAll<HTMLElement>("main, header, footer")].filter((e) => !root.contains(e));
    inertEls.forEach((e) => e.setAttribute("inert", ""));
    css(root, { display: "block" }); // stays shown after data-intro is removed, until the flash has faded

    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;
    let finished = false;
    const stage = document.createElement("div");
    stage.setAttribute("aria-hidden", "true");
    css(stage, { position: "absolute", inset: "0" });
    root.appendChild(stage);

    const finish = () => {
      if (finished) return;
      finished = true;
      html.removeAttribute("data-intro");
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      inertEls.forEach((e) => e.removeAttribute("inert"));
      release();
      window.dispatchEvent(new Event("intro-complete"));
    };
    const remove = () => css(root, { display: "none" });

    (async () => {
      await document.fonts.ready;
      if (cancelled) return;

      // ---- geometry, from the hero's own wordmark ----
      const h1 = document.querySelector<HTMLElement>("#hero h1");
      const text = h1?.firstChild;
      if (!h1 || !(text instanceof Text)) {
        finish();
        remove();
        return;
      }
      const cs = getComputedStyle(h1);
      const hr = h1.getBoundingClientRect();
      const range = document.createRange();
      const slots = [...text.data].map((ch, i) => {
        range.setStart(text, i);
        range.setEnd(text, i + 1);
        const r = range.getBoundingClientRect();
        return { ch, x: r.left, w: r.width };
      });
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const lh = parseFloat(cs.lineHeight);
      const nm = ctx.measureText("N");
      const baseline = (lh - (nm.fontBoundingBoxAscent + nm.fontBoundingBoxDescent)) / 2 + nm.fontBoundingBoxAscent;
      const capTop = baseline - nm.actualBoundingBoxAscent;
      const capH = nm.actualBoundingBoxAscent;
      const capMid = (capTop + baseline) / 2;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const top = hr.top;

      const letterStyle = {
        position: "absolute",
        top: `${top}px`,
        height: `${hr.height}px`,
        color: "var(--text)",
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      };
      const group = make(stage); // the shake moves all letters together
      css(group, { position: "absolute", inset: "0" });
      const letter = (i: number, extra: Record<string, string> = {}) => {
        const s = make(group, { ...letterStyle, left: `${slots[i].x}px`, ...extra }, "span");
        s.textContent = slots[i].ch;
        return s;
      };
      const [N, I, C, K, DOTCH, O, D, E] = [0, 1, 2, 3, 4, 5, 6, 7];
      const els = slots.map((_, i) => letter(i));
      gsap.set(els, { autoAlpha: 0 });
      const origin = (i: number) => `${slots[i].w / 2}px ${capMid}px`;

      // ---- the finished wordmark (reduced motion: just this, then a fade) ----
      if (reduced) {
        gsap.set(els, { autoAlpha: 1 });
        gsap.to(root, { opacity: 0, duration: 0.6, delay: 0.25, ease: "power1.inOut", onStart: finish, onComplete: remove });
        skipRef.current = () => {
          gsap.killTweensOf(root);
          finish();
          remove();
        };
        return;
      }

      const dotInk = ctx.measureText(".");
      const dotAsc = dotInk.actualBoundingBoxAscent;
      const dotX = slots[DOTCH].x + (dotInk.actualBoundingBoxRight - dotInk.actualBoundingBoxLeft) / 2;
      const dotY = top + baseline - dotAsc / 2;
      const left = slots[N].x;
      const right = slots[E].x + slots[E].w;
      const cx = (left + right) / 2;
      const cy = top + capMid;
      const rx = ((right - left) / 2) * 1.06;
      const ry = capH * 0.85;
      const rnd = mulberry32(11);

      const skip = root.querySelector<HTMLElement>(".intro-skip")!;
      tl = gsap.timeline({ paused: true, onComplete: () => remove() });
      Object.entries(T).forEach(([k, t]) => tl!.addLabel(k.toLowerCase(), t));
      const show = (el: Element, t: number) => tl!.set(el, { autoAlpha: 1 }, t);

      // 1 N: builds bottom to top behind a scan line, over a faint outline of itself
      const ghost = letter(N, { color: "transparent", webkitTextStroke: "1px var(--text)", opacity: "0.3" });
      gsap.set(ghost, { autoAlpha: 0 });
      group.insertBefore(ghost, els[N]);
      const scanN = make(group, { position: "absolute", left: `${slots[N].x - 12}px`, width: `${slots[N].w + 24}px`, height: "1.5px", background: "var(--text)", top: "0" });
      gsap.set(scanN, { autoAlpha: 0 });
      const rN = { v: 0 };
      tl.set(ghost, { autoAlpha: 0.3 }, T.N).set(scanN, { autoAlpha: 1 }, T.N);
      show(els[N], T.N);
      tl.fromTo(
        rN,
        { v: 0 },
        {
          v: 1,
          duration: 0.4,
          ease: "expo.out",
          onUpdate: () => {
            const y = lerp(baseline, capTop, rN.v);
            els[N].style.clipPath = `inset(${y}px -20px 0 -20px)`;
            scanN.style.transform = `translateY(${top + y}px)`;
          },
        },
        T.N,
      );
      tl.set(scanN, { autoAlpha: 0 }, T.N + 0.4).to(ghost, { autoAlpha: 0, duration: 0.2 }, T.N + 0.4);

      // 2 I: falls from above, lands with a 6px squash and bounce
      show(els[I], T.I);
      tl.fromTo(els[I], { y: -vh - 200 }, { y: 0, duration: 0.24, ease: cubicBezier(0.55, 0, 1, 0.45) }, T.I)
        .set(els[I], { transformOrigin: `50% ${baseline}px` }, T.I)
        .to(els[I], { scaleY: 1 - 6 / capH, duration: 0.04, ease: "power1.out" }, T.I + 0.24)
        .to(els[I], { scaleY: 1, duration: 0.12, ease: "back.out(3)" }, T.I + 0.28);

      // 3 C: slithers in from the far left in a damped sine wave (one swing), then curls into its slot
      show(els[C], T.C);
      const pc = { p: 0 };
      const cAt = (p: number) => ({
        x: -(slots[C].x + slots[C].w + 80) * (1 - p),
        y: (vh - (top + baseline)) * 0.5 * (1 - p) + capH * 0.22 * (1 - p) * Math.sin(p * Math.PI * 2),
      });
      tl.fromTo(
        pc,
        { p: 0 },
        {
          p: 1,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => {
            const a = cAt(pc.p);
            const b = cAt(Math.min(1, pc.p + 0.01));
            const tilt = Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI) * 0.5 * (1 - pc.p);
            gsap.set(els[C], { x: a.x, y: a.y, rotation: tilt, transformOrigin: origin(C) });
          },
        },
        T.C,
      );

      // 4 K: left-to-right wipe behind a vertical scan line (the brief skipped K; this is the proposed wipe)
      const scanK = make(group, { position: "absolute", top: `${top + capTop - 12}px`, left: "0", width: "1.5px", height: `${capH + 24}px`, background: "var(--text)" });
      gsap.set(scanK, { autoAlpha: 0 });
      const rK = { v: 0 };
      show(els[K], T.K);
      tl.set(scanK, { autoAlpha: 1 }, T.K).fromTo(
        rK,
        { v: 0 },
        {
          v: 1,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            els[K].style.clipPath = `inset(-20px ${(1 - rK.v) * 100}% -20px -20px)`;
            scanK.style.transform = `translateX(${slots[K].x + rK.v * slots[K].w}px)`;
          },
        },
        T.K,
      ).set(scanK, { autoAlpha: 0 }, T.K + 0.4);

      // 5 O: one merged move: a mini O flies in on a shallow arc from the right edge and grows on the
      // way, overshooting to 1.1 and settling at 1.0, with a dashed shock ring on arrival
      show(els[O], T.O);
      const po = { p: 0 };
      tl.set(els[O], { transformOrigin: origin(O), scale: 0.22 }, T.O).fromTo(
        po,
        { p: 0 },
        {
          p: 1,
          duration: 0.6,
          ease: "power2.inOut",
          onUpdate: () => {
            gsap.set(els[O], { x: (1 - po.p) * (vw - slots[O].x + 80), y: -Math.sin(po.p * Math.PI) * vh * 0.12 - (1 - po.p) * vh * 0.08 });
          },
        },
        T.O,
      );
      tl.to(els[O], { scale: 1.1, duration: 0.48, ease: "power2.inOut" }, T.O).to(els[O], { scale: 1, duration: 0.12, ease: "back.out(2)" }, T.O + 0.48);
      const shock = make(group, {
        position: "absolute",
        left: `${slots[O].x + slots[O].w / 2 - capH * 0.42}px`,
        top: `${top + capMid - capH * 0.42}px`,
        width: `${capH * 0.84}px`,
        height: `${capH * 0.84}px`,
        borderRadius: "50%",
        border: "1.5px dashed var(--text)",
      });
      gsap.set(shock, { autoAlpha: 0 });
      tl.fromTo(shock, { autoAlpha: 0.5, scale: 0.6 }, { autoAlpha: 0, scale: 1.8, duration: 0.3, ease: "power2.out", immediateRender: false }, T.O + 0.5);

      // 6 D: spirals in from the top-left, one full turn, scaling up
      show(els[D], T.D);
      const pd = { p: 0 };
      const dStart = { x: -slots[D].x * 0.9, y: -(top + baseline) * 1.05 };
      const dR = Math.hypot(dStart.x, dStart.y);
      const dTheta = Math.atan2(dStart.y, dStart.x);
      tl.fromTo(
        pd,
        { p: 0 },
        {
          p: 1,
          duration: 0.6,
          ease: "power3.out",
          onUpdate: () => {
            const r = dR * (1 - pd.p);
            const th = dTheta - Math.PI * 2 * (1 - pd.p);
            gsap.set(els[D], { x: r * Math.cos(th), y: r * Math.sin(th), rotation: 360 * (1 - pd.p), scale: 0.4 + 0.6 * pd.p, transformOrigin: origin(D) });
          },
        },
        T.D,
      );

      // 7 E: 18 fragments (3 x 6) scatter across the viewport and fly home, each with its own delay
      const COLS = 3;
      const ROWS = 6;
      const fw = slots[E].w / COLS;
      const fh = capH / ROWS;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const frag = make(group, { position: "absolute", left: `${slots[E].x + c * fw}px`, top: `${top + capTop + r * fh}px`, width: `${fw + 0.5}px`, height: `${fh + 0.5}px`, overflow: "hidden" });
          const copy = letter(E, { left: `${-c * fw}px`, top: `${-(capTop + r * fh)}px` });
          frag.appendChild(copy);
          gsap.set(copy, { autoAlpha: 1 });
          gsap.set(frag, { autoAlpha: 0 });
          const home = rnd() < 0.3;
          const from = home
            ? { x: 0, y: 0, rotation: 0, opacity: 1 }
            : { x: (rnd() - 0.5) * vw * 1.1 - fw * c, y: (rnd() - 0.5) * vh * 1.1, rotation: (rnd() * 2 - 1) * 200, opacity: 0.45 + rnd() * 0.55 };
          const delay = rnd() * 0.2;
          tl.set(frag, { autoAlpha: 1 }, T.E).fromTo(frag, from, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" }, T.E + delay);
        }
      }
      gsap.set(els[E], { autoAlpha: 0 }); // the fragments are the E

      // 8 the dot: drops to the top of an ellipse around the wordmark and swings half an orbit
      // (clockwise, down the right side to the bottom), speeding up
      show(els[DOTCH], T.DOT);
      const pDot = { x: cx, y: -80 };
      const placeDot = () => gsap.set(els[DOTCH], { x: pDot.x - dotX, y: pDot.y - dotY });
      placeDot();
      tl.fromTo(pDot, { x: cx, y: -80 }, { x: cx, y: cy - ry, duration: 0.12, ease: "power1.in", onUpdate: placeDot }, T.DOT);
      const pTheta = { a: -Math.PI / 2 };
      tl.fromTo(
        pTheta,
        { a: -Math.PI / 2 },
        {
          a: Math.PI / 2,
          duration: 0.28,
          ease: "power2.in",
          onUpdate: () => {
            pDot.x = cx + rx * Math.cos(pTheta.a);
            pDot.y = cy + ry * Math.sin(pTheta.a);
            placeDot();
          },
        },
        T.DOT + 0.12,
      );

      // 9 slam: dives into its slot in 100ms; wordmark shakes, three rings and 12 impact lines burst
      tl.fromTo(pDot, { x: cx, y: cy + ry }, { x: dotX, y: dotY, duration: 0.1, ease: "power4.in", onUpdate: placeDot, immediateRender: false }, T.SLAM);
      const rings = [0, 1, 2].map(() => {
        const ring = make(stage, { position: "absolute", left: `${dotX - 20}px`, top: `${dotY - 20}px`, width: "40px", height: "40px", borderRadius: "50%", border: "1.5px solid var(--text)" });
        gsap.set(ring, { autoAlpha: 0 });
        return ring;
      });
      rings.forEach((ring, i) => tl!.fromTo(ring, { autoAlpha: 0.7, scale: 0.3 }, { autoAlpha: 0, scale: 3 + i * 1.6, duration: 0.4, ease: "power2.out", immediateRender: false }, T.FLASH + i * 0.06));
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + rnd() * 0.2;
        const line = make(stage, { position: "absolute", left: `${dotX - 1}px`, top: `${dotY - 9}px`, width: "2px", height: "18px", background: "var(--text)" });
        gsap.set(line, { autoAlpha: 0 });
        tl.fromTo(
          line,
          { autoAlpha: 1, x: Math.cos(ang) * 30, y: Math.sin(ang) * 30, rotation: (ang * 180) / Math.PI + 90, scaleY: 1 },
          { autoAlpha: 0, x: Math.cos(ang) * (90 + rnd() * 50), y: Math.sin(ang) * (90 + rnd() * 50), scaleY: 0.4, duration: 0.28, ease: "power2.out", immediateRender: false },
          T.FLASH,
        );
      }
      [6, -6, 4, -4, 0].forEach((x, i) => tl!.to(group, { x, duration: 0.02, ease: "none" }, T.FLASH + i * 0.02));

      // 10 flash: a radial flash from the dot reaches the whole screen in 0.15s (white on dark, ink-black on light: --text)
      const flash = make(stage, { position: "absolute", inset: "0", background: "var(--text)" });
      const reach = Math.hypot(Math.max(dotX, vw - dotX), Math.max(dotY, vh - dotY)) + 20;
      gsap.set(flash, { clipPath: `circle(0px at ${dotX}px ${dotY}px)` });
      tl.fromTo(flash, { clipPath: `circle(0px at ${dotX}px ${dotY}px)` }, { clipPath: `circle(${reach}px at ${dotX}px ${dotY}px)`, duration: 0.15, ease: "none" }, T.FLASH);

      // 11 handoff: under the flash the intro layer goes away and the page is let in; the flash fades out over 0.45s
      tl.set(root, { backgroundColor: "transparent" }, T.HANDOFF)
        .set(group, { display: "none" }, T.HANDOFF)
        .set([...rings], { display: "none" }, T.HANDOFF)
        .call(finish, [], T.HANDOFF)
        .to(flash, { opacity: 0, duration: T.END - T.HANDOFF, ease: "power1.inOut" }, T.HANDOFF);
      tl.call(() => css(skip, { display: "none" }), [], T.HANDOFF);

      skipRef.current = () => {
        if (!tl) return;
        // Jump to the flash (2.40s) with events on, so every letter's onUpdate puts it in its slot, then play out the flash and handoff.
        if (tl.time() < T.FLASH) tl.seek(T.FLASH, false);
        css(skip, { display: "none" });
      };
      tl.play(0);
    })();

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skipRef.current();
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      tl?.kill();
      stage.remove();
      if (!finished) {
        inertEls.forEach((e) => e.removeAttribute("inert"));
        release();
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="intro">
      <button type="button" onClick={() => skipRef.current()} className="intro-skip">
        SKIP
      </button>
    </div>
  );
}
