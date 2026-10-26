import { stack, type Tech } from "@/content/stack";
import { mulberry32 } from "@/lib/motion";

/* The tech-stack network (DESIGN.md 7.5): a spherical graph grown from one root
   node, generation by generation. Positions are on the unit sphere;
   the renderer scales them. Built once from a seed, so it is the same every load.

   Counts, dot sizes and logo sizes follow the Figma final state (node 37:59):
   ~160 dot nodes over generations 1-7 (large near the root, small at the rim),
   thin edges, and one logo node per entry of content/stack.ts, spread over the
   whole sphere (front and back). */
export type NetNode = {
  id: number;
  gen: number;
  x: number;
  y: number;
  z: number;
  parent: number; // -1 for the root
  appear: number; // growth value at which the node is fully there
  dot: number; // dot diameter in Figma px
  logo: number; // index into `logos`, or -1
};

export type NetEdge = {
  a: number; // the earlier-generation end: lines grow from a to b
  b: number;
  gen: number;
  cross: boolean;
  start: number; // growth window
  end: number;
};

export type NetLogo = {
  node: number;
  label: string; // short text on the node when there is no icon
  name: string; // full name for the hover label
  icon?: string; // file name in /public/assets/tech
  d: number; // diameter in Figma px
  order: number; // pop-in order, 0 first
};

export type Network = { nodes: NetNode[]; edges: NetEdge[]; logos: NetLogo[]; maxGen: number };

export const MAX_GEN = 7;
const GEN_COUNTS = [1, 4, 10, 18, 28, 36, 36, 28];
// Angular distance from the root, in degrees, by generation. The root sits at the
// front pole of the sphere and growth spreads over its surface: the front mesh
// is generations 1-3, the silhouette 4-5, and 6-7 wrap round the back (seen
// dim and small through the middle), as in the Figma final state.
const GEN_ANGLE = [0, 20, 38, 55, 72, 92, 112, 156];
const GAP = 0.22; // the biggest empty patch allowed, in sphere radii
const GEN_SPREAD = [0, 14, 14, 14, 14, 14, 18, 46]; // +/- jitter; the last ring is a wide cap over the back
const DOT = [14, 9.9, 9.5, 9, 7.8, 6.2, 4.7, 3.7]; // Figma dot diameters by generation

const dist = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export function buildNetwork(techs: readonly Tech[] = stack, seed = 7): Network {
  const rnd = mulberry32(seed);
  // Root at the front pole, a little up and left of centre.
  const axis = (() => {
    const v = { x: -0.05, y: -0.1, z: 1 };
    const l = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
  })();
  // Two unit vectors perpendicular to the axis, to place points round it.
  const u0 = (() => {
    const t = { x: 0, y: 1, z: 0 };
    const d = t.x * axis.x + t.y * axis.y + t.z * axis.z;
    const v = { x: t.x - d * axis.x, y: t.y - d * axis.y, z: t.z - d * axis.z };
    const l = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
  })();
  const v0 = {
    x: axis.y * u0.z - axis.z * u0.y,
    y: axis.z * u0.x - axis.x * u0.z,
    z: axis.x * u0.y - axis.y * u0.x,
  };
  const onSurface = (deg: number, phi: number) => {
    const th = (deg * Math.PI) / 180;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);
    return {
      x: axis.x * c + (u0.x * cp + v0.x * sp) * s,
      y: axis.y * c + (u0.y * cp + v0.y * sp) * s,
      z: axis.z * c + (u0.z * cp + v0.z * sp) * s,
    };
  };

  const nodes: NetNode[] = [{ id: 0, gen: 0, ...axis, parent: -1, appear: 0, dot: DOT[0], logo: -1 }];
  const edges: NetEdge[] = [];

  // Tree: each generation is placed on its ring by best-candidate sampling
  // (spread out, short to its parent), then joined to the nearest node of the
  // generation before.
  for (let g = 1; g <= MAX_GEN; g++) {
    for (let i = 0; i < GEN_COUNTS[g]; i++) {
      let best = { x: 0, y: 0, z: 0 };
      let bestScore = -Infinity;
      for (let c = 0; c < 28; c++) {
        const p = onSurface(Math.min(180, GEN_ANGLE[g] + (rnd() - 0.5) * GEN_SPREAD[g]), rnd() * Math.PI * 2);
        let nearest = Infinity;
        for (const n of nodes) nearest = Math.min(nearest, dist(p, n));
        let toParent = Infinity;
        for (const n of nodes) if (n.gen === g - 1) toParent = Math.min(toParent, dist(p, n));
        const score = nearest - 0.4 * toParent;
        if (score > bestScore) {
          bestScore = score;
          best = p;
        }
      }
      let parent = 0;
      let pd = Infinity;
      for (const n of nodes) {
        if (n.gen !== g - 1) continue;
        const d = dist(best, n);
        if (d < pd) {
          pd = d;
          parent = n.id;
        }
      }
      const id = nodes.length;
      const start = g - 1 + rnd() * 0.22;
      const end = g - rnd() * 0.06;
      nodes.push({ id, gen: g, ...best, parent, appear: end, dot: DOT[g] * (0.94 + rnd() * 0.12), logo: -1 });
      edges.push({ a: parent, b: id, gen: g, cross: false, start, end });
    }
  }

  // Fill any hole: keep adding a node at the spot farthest from every node (found on
  // a fine sample of the sphere) until no empty patch is bigger than GAP, each joined
  // to its nearest node and one generation after it, so growth still flows outward.
  const samples = Array.from({ length: 1100 }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / 1100;
    const r = Math.sqrt(1 - y * y);
    const t = i * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
  });
  // Each sample's distance to its nearest node, kept up to date as nodes are added.
  const nearestTo = samples.map((sp) => Math.min(...nodes.map((n) => dist(sp, n))));
  for (let guard = 0; guard < 120; guard++) {
    let farI = 0;
    for (let i = 1; i < samples.length; i++) if (nearestTo[i] > nearestTo[farI]) farI = i;
    const far = samples[farI];
    const farD = nearestTo[farI];
    if (farD < GAP) break;
    let parent = nodes[0];
    for (const n of nodes) if (dist(far, n) < dist(far, parent)) parent = n;
    const g = Math.min(MAX_GEN, parent.gen + 1);
    const id = nodes.length;
    const start = g - 1 + rnd() * 0.22;
    const end = g - rnd() * 0.06;
    nodes.push({ id, gen: g, ...far, parent: parent.id, appear: end, dot: DOT[g] * (0.94 + rnd() * 0.12), logo: -1 });
    edges.push({ a: parent.id, b: id, gen: g, cross: false, start, end });
    for (let i = 0; i < samples.length; i++) nearestTo[i] = Math.min(nearestTo[i], dist(samples[i], far));
  }

  // Cross-links between neighbours that are not already joined; each appears with
  // the generation of its later endpoint.
  const linked = new Set(edges.map((e) => `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`));
  const degree = new Array(nodes.length).fill(0);
  edges.forEach((e) => {
    degree[e.a]++;
    degree[e.b]++;
  });
  for (const n of nodes) {
    if (n.id === 0 || rnd() > 0.92) continue;
    const near = nodes
      .filter((m) => m.id !== n.id)
      .map((m) => ({ m, d: dist(n, m) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 5);
    let made = 0;
    for (const { m, d } of near) {
      if (made >= 3) break;
      const key = `${Math.min(n.id, m.id)}-${Math.max(n.id, m.id)}`;
      if (m.id === 0 || d > 0.5 || linked.has(key) || degree[n.id] >= 6 || degree[m.id] >= 6) continue;
      const [a, b] = n.gen <= m.gen ? [n, m] : [m, n];
      const gen = Math.max(a.gen, b.gen);
      linked.add(key);
      degree[a.id]++;
      degree[b.id]++;
      edges.push({ a: a.id, b: b.id, gen, cross: true, start: gen - 1 + 0.3 + rnd() * 0.25, end: gen - 0.02 });
      made++;
    }
  }

  // Logo nodes: nodes of generation 2-7, spread over the whole sphere by
  // farthest-point sampling (about half end up round the back), sizes by tool,
  // pop-in order shuffled.
  const pool = nodes.filter((n) => n.gen >= 2);
  const picked: NetNode[] = [pool[Math.floor(rnd() * pool.length)]];
  while (picked.length < techs.length) {
    let far: NetNode | null = null;
    let farD = -1;
    for (const n of pool) {
      if (picked.includes(n)) continue;
      const d = Math.min(...picked.map((p) => dist(n, p)));
      if (d > farD) {
        farD = d;
        far = n;
      }
    }
    if (!far) break;
    picked.push(far);
  }
  const bySpread = picked.map((n, i) => ({ n, i }));
  const order = techs.map((_, i) => i).sort(() => rnd() - 0.5);
  const logos: NetLogo[] = techs.map((t, i) => ({
    label: t.label,
    name: t.name,
    icon: t.icon,
    d: t.size,
    node: bySpread[i].n.id,
    order: order[i],
  }));
  logos.forEach((l, i) => (nodes[l.node].logo = i));

  return { nodes, edges, logos, maxGen: MAX_GEN };
}

// The default network is built once and shared (the pinned scene and the expanded view).
let shared: Network | null = null;
export const sharedNetwork = () => (shared ??= buildNetwork());
