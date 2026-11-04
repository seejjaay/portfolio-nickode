/* Swarm build: a handful of colored "agents" (multiplayer-style cursors) build a
   section as it scrolls into view. Each block marked data-swarm starts hidden;
   when it enters the viewport an agent claims it, drags a selection box over it
   (live size label, guide lines) and the block is revealed under the box. Built
   once per page load, then it stays built.

   Every agent behaves like a separate person on a separate mouse: it appears
   from its own direction (any viewport edge, or just pops into existence), moves
   along its own curved, slightly wobbly path at its own speed, grabs a random
   corner of the block (usually the nearest one) and drags to the opposite one,
   sometimes overshooting before it settles. Between jobs agents wander the page,
   and now and then one rubber-bands a selection in empty space and lets go.
   When the section is built they leave in different directions.

   Everything lives in an aria-hidden, pointer-events:none layer inside the
   section, in section-relative coordinates, so scrolling never detaches a box
   from its block. Colors come from the --agent-* tokens. */
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

const HOLD = 420; // ms the box stays after the block appears
const HUD_LINGER = 1600; // ms the HUD stays after the last layer
const MAX_STRAYS = 2; // agents rubber-banding empty space at once
const MAX_AMBIENT = 2; // agents loitering without a job at once

type Phase = "away" | "idle" | "wander" | "travel" | "draw" | "hold" | "leave" | "exit";
type Pt = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };
type Ease = (t: number) => number;

type Agent = {
  cursor: HTMLElement;
  box: HTMLElement;
  size: HTMLElement;
  guideH: HTMLElement;
  guideV: HTMLElement;
  phase: Phase;
  x: number;
  y: number;
  free: number; // 0 = kept inside the visible area, 1 = may be anywhere (off screen, scrolled away)
  from: Pt;
  to: Pt;
  bend: number; // sideways bow of the current path, in px
  t0: number;
  dur: number;
  ease: Ease;
  rect: Rect;
  anchor: Pt; // the corner the drag starts on
  far: Pt; // the corner it ends on
  dragBend: number;
  overshoot: number;
  job: HTMLElement | null;
  stray: boolean; // a selection drawn in empty space, no block behind it
  nextIdle: number;
  idleSince: number;
  speed: number; // personality: how fast this person moves
  wobble: number; // personality: how shaky their hand is
  drift: number;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const DRAG_EASES: Ease[] = [easeInOut, easeInOutQuad, easeOutQuad, (t) => t * t * (3 - 2 * t)];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const sign = () => (Math.random() < 0.5 ? -1 : 1);

/* A point on the quadratic curve from a to b, bowed sideways by `bend` px. */
function curve(a: Pt, b: Pt, bend: number, t: number): Pt {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (a.x + b.x) / 2 - (dy / len) * bend;
  const cy = (a.y + b.y) / 2 + (dx / len) * bend;
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y };
}

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
  let nextSpawn = 0;
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
      x: 0, y: 0, free: 1,
      from: { x: 0, y: 0 }, to: { x: 0, y: 0 },
      bend: 0, t0: 0, dur: 1, ease: easeOut,
      rect: { x: 0, y: 0, w: 0, h: 0 },
      anchor: { x: 0, y: 0 }, far: { x: 0, y: 0 },
      dragBend: 0, overshoot: 0,
      job: null, stray: false,
      nextIdle: 0, idleSince: 0,
      speed: rand(0.8, 1.3),
      wobble: rand(0.8, 2.6),
      drift: i * 1.7 + Math.random() * 2,
    };
  });

  // The viewport, in section coordinates. `view` is the safe area a working
  // cursor is kept inside (below the nav, above the HUD, with room for its name
  // pill); `vp` is the whole screen, used to pick where agents come from and go to.
  let view = { l: 12, r: 1000, t: 0, b: 800 };
  let vp = { l: 0, r: 1000, t: 0, b: 800, h: 2000 };
  const measureView = () => {
    const hr = host.getBoundingClientRect();
    view = { l: 12, r: hr.width - 86, t: 76 - hr.top, b: window.innerHeight - 96 - hr.top };
    vp = { l: 0, r: hr.width, t: -hr.top, b: window.innerHeight - hr.top, h: hr.height };
  };

  const place = (a: Agent) => {
    const cx = clamp(a.x, view.l, Math.max(view.l, view.r));
    const cy = clamp(a.y, view.t, Math.max(view.t, view.b));
    const x = cx + (a.x - cx) * a.free;
    const y = cy + (a.y - cy) * a.free;
    a.cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  // The box is whatever rectangle the anchor corner and the cursor span.
  const setBox = (a: Agent, x: number, y: number) => {
    const w = Math.abs(x - a.anchor.x);
    const h = Math.abs(y - a.anchor.y);
    a.box.style.left = `${Math.min(a.anchor.x, x)}px`;
    a.box.style.top = `${Math.min(a.anchor.y, y)}px`;
    a.box.style.width = `${w}px`;
    a.box.style.height = `${h}px`;
    a.size.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  };

  const hostRect = () => host.getBoundingClientRect();
  const isFree = (a: Agent) => a.phase === "idle" || a.phase === "wander" || a.phase === "away";
  const randomViewPoint = (): Pt => ({
    x: rand(view.l + 20, Math.max(view.l + 21, view.r - 20)),
    y: rand(view.t + 30, Math.max(view.t + 31, view.b - 30)),
  });

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

  /* Where a newly arriving agent starts: just past a random screen edge, or (about
     one time in three) it simply pops into existence near where it is needed. */
  const arrive = (a: Agent, near: Pt) => {
    a.cursor.classList.remove("is-pop");
    if (Math.random() < 0.34) {
      const ang = rand(0, Math.PI * 2);
      const r = rand(120, 300);
      a.x = clamp(near.x + Math.cos(ang) * r, view.l, Math.max(view.l, view.r));
      a.y = clamp(near.y + Math.sin(ang) * r, view.t, Math.max(view.t, view.b));
      void a.cursor.offsetWidth; // restart the pop animation
      a.cursor.classList.add("is-pop");
    } else {
      const sides: ("l" | "r" | "t" | "b")[] = ["l", "l", "l", "r", "r", "r"];
      if (vp.t >= 0) sides.push("t", "t"); // only when the top of the screen is inside the section
      if (vp.b <= vp.h) sides.push("b", "b");
      const side = pick(sides);
      const H = vp.b - vp.t;
      if (side === "l") { a.x = vp.l - 60; a.y = rand(vp.t + H * 0.15, vp.b - H * 0.15); }
      else if (side === "r") { a.x = vp.r + 60; a.y = rand(vp.t + H * 0.15, vp.b - H * 0.15); }
      else if (side === "t") { a.x = rand(vp.l + vp.r * 0.1, vp.r * 0.9); a.y = vp.t - 60; }
      else { a.x = rand(vp.l + vp.r * 0.1, vp.r * 0.9); a.y = vp.b + 60; }
    }
    a.cursor.classList.add("is-in");
  };

  /* Sets an agent off toward `rect`: it picks which corner to grab (usually the
     nearest, otherwise any), where to end, and how its hand moves on the way. */
  const approach = (a: Agent, rect: Rect, now: number) => {
    a.rect = rect;
    if (a.phase === "away") arrive(a, { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });

    // A block taller than the screen is only grabbed by its top corners.
    const tall = rect.h > window.innerHeight * 0.7;
    const corners: Pt[] = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w, y: rect.y },
      { x: rect.x, y: rect.y + rect.h },
      { x: rect.x + rect.w, y: rect.y + rect.h },
    ];
    const pool = tall ? corners.slice(0, 2) : corners;
    const nearest = pool.reduce((best, c) => (Math.hypot(c.x - a.x, c.y - a.y) < Math.hypot(best.x - a.x, best.y - a.y) ? c : best));
    a.anchor = Math.random() < 0.6 ? nearest : pick(pool);
    a.far = { x: rect.x + rect.w - (a.anchor.x - rect.x), y: rect.y + rect.h - (a.anchor.y - rect.y) };
    a.dragBend = sign() * rand(0, Math.min(20, Math.hypot(rect.w, rect.h) * 0.05));
    a.overshoot = Math.random() < 0.55 ? rand(5, 16) : 0;

    a.from = { x: a.x, y: a.y };
    a.to = a.anchor;
    const dist = Math.hypot(a.to.x - a.from.x, a.to.y - a.from.y);
    a.bend = sign() * dist * rand(0.06, 0.26);
    a.dur = clamp(dist / (1.9 * a.speed), 300, 950);
    a.ease = Math.random() < 0.5 ? easeOut : easeOutQuad;
    a.t0 = now;
    a.phase = "travel";
  };

  const assign = (a: Agent, target: HTMLElement, now: number) => {
    measureView();
    const hr = hostRect();
    const r = target.getBoundingClientRect();
    a.job = target;
    a.stray = false;
    status.set(target, "busy");
    approach(a, { x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height }, now);
    nextAssign = now + rand(90, 420);
  };

  // A rubber-band selection in empty space: drawn, held a moment, dropped.
  const startStray = (a: Agent, now: number) => {
    const w = rand(90, Math.min(420, (view.r - view.l) * 0.6));
    const h = rand(44, 190);
    const p = randomViewPoint();
    a.job = null;
    a.stray = true;
    approach(a, { x: clamp(p.x - w / 2, 12, Math.max(12, vp.r - w - 12)), y: p.y - h / 2, w, h }, now);
  };

  const wander = (a: Agent, now: number) => {
    a.from = { x: a.x, y: a.y };
    a.to = randomViewPoint();
    const dist = Math.hypot(a.to.x - a.from.x, a.to.y - a.from.y);
    a.bend = sign() * dist * rand(0.05, 0.22);
    a.dur = clamp(dist / (0.7 * a.speed), 600, 1700);
    a.ease = easeInOutQuad;
    a.t0 = now;
    a.phase = "wander";
  };

  const exit = (a: Agent, now: number) => {
    const side = pick(["l", "r", "t", "b"] as const);
    const to: Pt =
      side === "l" ? { x: vp.l - 80, y: a.y + rand(-160, 160) }
      : side === "r" ? { x: vp.r + 80, y: a.y + rand(-160, 160) }
      : side === "t" ? { x: a.x + rand(-200, 200), y: vp.t - 80 }
      : { x: a.x + rand(-200, 200), y: vp.b + 80 };
    a.from = { x: a.x, y: a.y };
    a.to = to;
    a.bend = sign() * Math.hypot(to.x - a.x, to.y - a.y) * rand(0.05, 0.2);
    a.dur = clamp(Math.hypot(to.x - a.x, to.y - a.y) / (1.5 * a.speed), 500, 1200);
    a.ease = (t) => t * t * (3 - 2 * t);
    a.t0 = now;
    a.phase = "exit";
  };

  const pickNext = () => {
    queue.sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top);
    return queue.shift();
  };

  const settle = (a: Agent, now: number) => {
    a.phase = "idle";
    a.idleSince = now;
    a.nextIdle = now + rand(500, 1800);
    a.free = 1;
  };

  const step = (a: Agent, now: number) => {
    const t = (now - a.t0) / a.dur;
    switch (a.phase) {
      case "travel": {
        const p = a.ease(clamp(t, 0, 1));
        const pt = curve(a.from, a.to, a.bend, p);
        const shake = a.wobble * (1 - p);
        a.x = pt.x + Math.sin(now / 60 + a.drift) * shake;
        a.y = pt.y + Math.cos(now / 70 + a.drift) * shake;
        a.free = 1 - p;
        if (t >= 1) {
          a.x = a.anchor.x;
          a.y = a.anchor.y;
          a.free = 0;
          a.phase = "draw";
          a.t0 = now;
          const span = Math.hypot(a.far.x - a.anchor.x, a.far.y - a.anchor.y);
          a.dur = clamp((380 + span * 0.55) / a.speed, 450, 1000);
          a.ease = pick(DRAG_EASES);
          a.guideH.style.top = `${a.anchor.y}px`;
          a.guideV.style.left = `${a.anchor.x}px`;
          setBox(a, a.anchor.x, a.anchor.y);
          a.box.classList.add("is-on");
          a.guideH.classList.add("is-on");
          a.guideV.classList.add("is-on");
          a.cursor.classList.add("is-down");
        }
        break;
      }
      case "draw": {
        const tt = clamp(t, 0, 1);
        const p = a.ease(tt);
        const dx = a.far.x - a.anchor.x;
        const dy = a.far.y - a.anchor.y;
        const len = Math.hypot(dx, dy) || 1;
        const arc = Math.sin(Math.PI * p) * a.dragBend; // the hand does not drag in a ruler line
        const over = a.overshoot * Math.sin(Math.PI * clamp((tt - 0.55) / 0.45, 0, 1)); // slips past, then corrects
        a.x = a.anchor.x + dx * p - (dy / len) * arc + (dx / len) * over;
        a.y = a.anchor.y + dy * p + (dx / len) * arc + (dy / len) * over;
        a.free = 0;
        setBox(a, a.x, a.y);
        if (t >= 1) {
          a.x = a.far.x;
          a.y = a.far.y;
          setBox(a, a.x, a.y);
          if (a.job) finish(a.job);
          a.cursor.classList.remove("is-down");
          a.phase = "hold";
          a.t0 = now;
          a.dur = a.stray ? 260 : HOLD;
        }
        break;
      }
      case "hold": {
        a.free = 0;
        if (t >= 1) {
          a.box.classList.remove("is-on");
          a.guideH.classList.remove("is-on");
          a.guideV.classList.remove("is-on");
          // Lets go and drifts off in a random direction, staying on screen.
          const ang = rand(0, Math.PI * 2);
          const d = rand(70, 220);
          a.from = { x: a.x, y: a.y };
          a.to = {
            x: clamp(a.x + Math.cos(ang) * d, view.l, Math.max(view.l, view.r)),
            y: clamp(a.y + Math.sin(ang) * d, view.t, Math.max(view.t, view.b)),
          };
          a.bend = sign() * d * rand(0.1, 0.3);
          a.phase = "leave";
          a.t0 = now;
          a.dur = rand(550, 950);
          a.ease = easeOut;
          a.job = null;
          a.stray = false;
        }
        break;
      }
      case "leave": {
        const p = a.ease(clamp(t, 0, 1));
        const pt = curve(a.from, a.to, a.bend, p);
        a.x = pt.x;
        a.y = pt.y;
        a.free = p;
        if (t >= 1) settle(a, now);
        break;
      }
      case "wander": {
        const p = a.ease(clamp(t, 0, 1));
        const pt = curve(a.from, a.to, a.bend, p);
        a.x = pt.x + Math.sin(now / 90 + a.drift) * a.wobble * 0.5;
        a.y = pt.y + Math.cos(now / 110 + a.drift) * a.wobble * 0.5;
        a.free = 1;
        if (t >= 1) settle(a, now);
        break;
      }
      case "idle": {
        // A small hover while waiting. Now and then: wander, rubber-band, or give up and leave.
        a.free = 1;
        a.x += Math.sin(now / 520 + a.drift) * 0.18;
        a.y += Math.cos(now / 610 + a.drift) * 0.18;
        if (now >= a.nextIdle) {
          const strays = agents.filter((o) => o.stray).length;
          if (complete || now - a.idleSince > 6500) exit(a, now);
          else if (hostVisible && strays < MAX_STRAYS && Math.random() < 0.3) startStray(a, now);
          else if (hostVisible && Math.random() < 0.75) wander(a, now);
          else a.nextIdle = now + rand(600, 1600);
        }
        break;
      }
      case "exit": {
        const p = a.ease(clamp(t, 0, 1));
        const pt = curve(a.from, a.to, a.bend, p);
        a.x = pt.x;
        a.y = pt.y;
        a.free = 1;
        if (t >= 1) {
          a.cursor.classList.remove("is-in", "is-pop", "is-down");
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
    measureView();

    while (queue.length && now >= nextAssign) {
      const free = agents.filter(isFree);
      if (!free.length) break;
      const target = pickNext();
      if (!target) break;
      // Scrolled past before an agent got there: reveal it without the show.
      if (!visible.has(target)) finish(target);
      else assign(pick(free), target, now);
    }

    // Someone new turns up now and then, with no job, and starts moving around.
    if (hostVisible && !complete && now >= nextSpawn) {
      nextSpawn = now + rand(900, 2600);
      const loitering = agents.filter((o) => o.phase === "idle" || o.phase === "wander" || o.stray).length;
      const gone = agents.filter((o) => o.phase === "away");
      if (loitering < MAX_AMBIENT && gone.length) {
        const a = pick(gone);
        arrive(a, randomViewPoint());
        wander(a, now);
      }
    }

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
