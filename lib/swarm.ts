/* Swarm build: a handful of colored "agents" (multiplayer-style cursors) build a
   section as it scrolls into view. Each block marked data-swarm starts hidden;
   when it enters the viewport an agent flies to its top-left corner, drags a
   selection box out to the bottom-right corner (live size label, guide lines),
   and the block is revealed under the box. Built once per page load, then it
   stays built. Everything lives in an aria-hidden, pointer-events:none layer
   inside the section, in section-relative coordinates, so scrolling never moves
   a box away from its block. Colors come from the --agent-* tokens. */
import { clamp } from "@/lib/motion";

export const AGENTS = [
  { name: "Layout", color: "var(--agent-1)" },
  { name: "Type", color: "var(--agent-2)" },
  { name: "Motion", color: "var(--agent-3)" },
  { name: "Color", color: "var(--agent-4)" },
  { name: "Copy", color: "var(--agent-5)" },
] as const;

// Every live HUD on the page, so showing one hides the others (one pill at a time).
const huds = new Set<HTMLElement>();
const showHud = (hud: HTMLElement, on: boolean) => {
  if (on) huds.forEach((h) => h !== hud && h.classList.remove("is-on"));
  hud.classList.toggle("is-on", on);
};

const STAGGER = 170; // ms between two agents picking up work
const HOLD = 420; // ms the box stays after the block appears
const HUD_LINGER = 1600; // ms the HUD stays after the last layer

type Phase = "away" | "idle" | "travel" | "draw" | "hold" | "leave";
type Rect = { x: number; y: number; w: number; h: number };
type Agent = {
  cursor: HTMLElement;
  box: HTMLElement;
  size: HTMLElement;
  guideH: HTMLElement;
  guideV: HTMLElement;
  phase: Phase;
  x: number;
  y: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  t0: number;
  dur: number;
  rect: Rect;
  job: HTMLElement | null;
  drift: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const CURSOR_SVG =
  '<svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden="true"><path d="M3 2.5v17l4.6-4.1 3.1 7 2.8-1.3-3.1-6.9H17.5L3 2.5Z" fill="var(--c)" stroke="var(--agent-edge)" stroke-width="1.5" stroke-linejoin="round"/></svg>';

function el(cls: string, parent?: HTMLElement, tag = "div") {
  const node = document.createElement(tag);
  node.className = cls;
  parent?.appendChild(node);
  return node;
}

export function startSwarm(layer: HTMLElement, host: HTMLElement, all: HTMLElement[]): () => void {
  // Blocks that are display:none (a mobile-only or desktop-only variant) never build.
  const targets = all.filter((t) => t.getClientRects().length > 0);
  if (!targets.length) return () => {};

  const total = targets.length;
  let built = 0;
  let complete = false;
  let hostVisible = false;
  let raf = 0;
  let nextAssign = 0;
  let hudTimer = 0;
  const status = new Map<HTMLElement, "pending" | "queued" | "busy" | "done">();
  const visible = new Set<HTMLElement>();
  const queue: HTMLElement[] = [];

  // HUD (the bottom pill) -----------------------------------------------------
  const hud = el("swarm-hud", layer);
  huds.add(hud);
  const dots = el("swarm-dots", hud, "span");
  AGENTS.forEach((a) => el("swarm-dot", dots, "i").style.setProperty("--c", a.color));
  const count = el("swarm-count", hud, "span");
  const renderHud = () => {
    count.textContent = `${AGENTS.length} agents · ${built} / ${total} layers`;
  };
  renderHud();

  // Agents --------------------------------------------------------------------
  const agents: Agent[] = AGENTS.map((spec, i) => {
    const wrap = (cls: string) => {
      const n = el(cls, layer);
      n.style.setProperty("--c", spec.color);
      return n;
    };
    const guideH = wrap("swarm-guide swarm-guide-h");
    const guideV = wrap("swarm-guide swarm-guide-v");
    const box = wrap("swarm-box");
    ["tl", "tr", "bl", "br"].forEach((c) => el(`swarm-handle ${c}`, box, "i"));
    const size = el("swarm-size", box, "span");
    const cursor = wrap("swarm-agent");
    cursor.innerHTML = CURSOR_SVG;
    el("swarm-name", cursor, "span").textContent = spec.name;
    return {
      cursor, box, size, guideH, guideV,
      phase: "away" as Phase,
      x: 0, y: 0,
      from: { x: 0, y: 0 }, to: { x: 0, y: 0 },
      t0: 0, dur: 1,
      rect: { x: 0, y: 0, w: 0, h: 0 },
      job: null,
      drift: i * 1.7,
    };
  });

  // Where the viewport sits inside the section, so a cursor dragging a corner that
  // is off-screen (a tall or full-width block) stays where the visitor can see it.
  let view = { l: 12, r: 1000, t: 0, b: 800 };
  const measureView = () => {
    const hr = host.getBoundingClientRect();
    view = { l: 12, r: hr.width - 86, t: 76 - hr.top, b: window.innerHeight - 96 - hr.top };
  };

  const place = (a: Agent) => {
    // The fly-in may start outside the section, so only the draw and later phases clamp x.
    const x = a.phase === "travel" ? a.x : clamp(a.x, view.l, Math.max(view.l, view.r));
    const y = clamp(a.y, view.t, Math.max(view.t, view.b));
    a.cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const setBox = (a: Agent, w: number, h: number) => {
    a.box.style.width = `${w}px`;
    a.box.style.height = `${h}px`;
    a.size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  };

  // Work ----------------------------------------------------------------------
  const finish = (target: HTMLElement) => {
    if (status.get(target) === "done") return;
    status.set(target, "done");
    target.dataset.swarm = "done";
    built += 1;
    renderHud();
    if (built === total) {
      complete = true;
      window.clearTimeout(hudTimer);
      hudTimer = window.setTimeout(() => showHud(hud, false), HUD_LINGER);
    }
  };

  const hostRect = () => host.getBoundingClientRect();

  const assign = (a: Agent, target: HTMLElement, now: number) => {
    const hr = hostRect();
    const r = target.getBoundingClientRect();
    a.rect = { x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height };
    a.job = target;
    status.set(target, "busy");

    if (a.phase === "away") {
      const fromLeft = a.rect.x + a.rect.w / 2 < hr.width / 2;
      a.x = fromLeft ? -50 : hr.width + 50;
      a.y = clamp(a.rect.y - 60 + Math.random() * 140, 24, Math.max(24, hr.height - 24));
      a.cursor.classList.add("is-in");
    }
    a.from = { x: a.x, y: a.y };
    a.to = { x: a.rect.x, y: a.rect.y };
    const dist = Math.hypot(a.to.x - a.from.x, a.to.y - a.from.y);
    a.dur = clamp(dist / 2.2, 300, 700);
    a.t0 = now;
    a.phase = "travel";
    nextAssign = now + STAGGER;
  };

  const pickNext = () => {
    queue.sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top);
    return queue.shift();
  };

  const step = (a: Agent, now: number) => {
    const t = (now - a.t0) / a.dur;
    switch (a.phase) {
      case "travel": {
        const p = easeOut(clamp(t, 0, 1));
        a.x = a.from.x + (a.to.x - a.from.x) * p;
        a.y = a.from.y + (a.to.y - a.from.y) * p;
        if (t >= 1) {
          a.phase = "draw";
          a.t0 = now;
          a.dur = clamp(420 + Math.min(a.rect.w, 900) * 0.35, 480, 800);
          a.box.style.left = `${a.rect.x}px`;
          a.box.style.top = `${a.rect.y}px`;
          a.guideH.style.top = `${a.rect.y}px`;
          a.guideV.style.left = `${a.rect.x}px`;
          setBox(a, 0, 0);
          a.box.classList.add("is-on");
          a.guideH.classList.add("is-on");
          a.guideV.classList.add("is-on");
        }
        break;
      }
      case "draw": {
        const p = easeInOut(clamp(t, 0, 1));
        a.x = a.rect.x + a.rect.w * p;
        a.y = a.rect.y + a.rect.h * p;
        setBox(a, a.rect.w * p, a.rect.h * p);
        if (t >= 1) {
          if (a.job) finish(a.job);
          a.phase = "hold";
          a.t0 = now;
          a.dur = HOLD;
        }
        break;
      }
      case "hold": {
        if (t >= 1) {
          a.box.classList.remove("is-on");
          a.guideH.classList.remove("is-on");
          a.guideV.classList.remove("is-on");
          const hr = hostRect();
          const dir = a.rect.x + a.rect.w / 2 < hr.width / 2 ? -1 : 1;
          a.from = { x: a.x, y: a.y };
          a.to = {
            x: clamp(a.x + dir * (60 + Math.random() * 120), 16, hr.width - 16),
            y: clamp(a.y + 30 + Math.random() * 90, 16, Math.max(16, hr.height - 16)),
          };
          a.phase = "leave";
          a.t0 = now;
          a.dur = 600;
          a.job = null;
        }
        break;
      }
      case "leave": {
        const p = easeOut(clamp(t, 0, 1));
        a.x = a.from.x + (a.to.x - a.from.x) * p;
        a.y = a.from.y + (a.to.y - a.from.y) * p;
        if (t >= 1) a.phase = "idle";
        break;
      }
      case "idle": {
        // A small hover while waiting for work, then gone once the section is built.
        a.x += Math.sin(now / 520 + a.drift) * 0.18;
        a.y += Math.cos(now / 610 + a.drift) * 0.18;
        if (complete) {
          a.cursor.classList.remove("is-in");
          a.phase = "away";
        }
        break;
      }
      default:
        break;
    }
    place(a);
  };

  const tick = (now: number) => {
    raf = 0;
    while (queue.length && now >= nextAssign) {
      const free = agents.find((a) => a.phase === "idle" || a.phase === "away");
      if (!free) break;
      const target = pickNext();
      if (!target) break;
      // Scrolled past before an agent got there: reveal it without the show.
      if (!visible.has(target)) finish(target);
      else assign(free, target, now);
    }

    measureView();
    agents.forEach((a) => step(a, now));

    if (complete && agents.every((a) => a.phase === "away")) return;
    const sleeping = !complete && !hostVisible && queue.length === 0 && agents.every((a) => a.phase === "idle" || a.phase === "away");
    if (!sleeping) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };

  // Observers -----------------------------------------------------------------
  targets.forEach((t) => {
    t.dataset.swarm = "pending";
    status.set(t, "pending");
  });

  const targetObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          visible.add(target);
          if (status.get(target) === "pending") {
            status.set(target, "queued");
            queue.push(target);
          }
        } else {
          visible.delete(target);
        }
      });
      wake();
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0 },
  );
  targets.forEach((t) => targetObserver.observe(t));

  const hostObserver = new IntersectionObserver(
    ([entry]) => {
      hostVisible = entry.isIntersecting;
      wake();
    },
    { threshold: 0 },
  );
  hostObserver.observe(host);

  // The HUD belongs to whichever section crosses the middle of the viewport, so
  // two sections never stack their pills in the same spot.
  const hudObserver = new IntersectionObserver(
    ([entry]) => {
      if (!complete) showHud(hud, entry.isIntersecting);
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
  );
  hudObserver.observe(host);

  // A block that is still hidden must never be used blind: focusing or pressing
  // it (keyboard Tab into the form, a tap on a row) reveals it on the spot.
  const revealNow = (event: Event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>("[data-swarm]");
    if (target && status.get(target) !== "done" && status.has(target)) {
      const i = queue.indexOf(target);
      if (i >= 0) queue.splice(i, 1);
      finish(target);
    }
  };
  host.addEventListener("focusin", revealNow);
  host.addEventListener("pointerdown", revealNow);

  return () => {
    window.cancelAnimationFrame(raf);
    window.clearTimeout(hudTimer);
    targetObserver.disconnect();
    hostObserver.disconnect();
    hudObserver.disconnect();
    host.removeEventListener("focusin", revealNow);
    host.removeEventListener("pointerdown", revealNow);
    targets.forEach((t) => delete t.dataset.swarm);
    huds.delete(hud);
    layer.replaceChildren();
  };
}
