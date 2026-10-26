"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clamp, lerp } from "@/lib/motion";
import { CLOSED_DROP, LID_OPEN, TILT, type SceneState } from "./laptop-motion";

/* The 3D laptop (DESIGN.md 7.4). World units are Figma pixels, so the model is
   1000 wide with a 972x597 display, as in the design. The hinge is the origin:
   the deck runs forward (+z) from it, the lid is a child that pivots about it.
   Colours come from the --laptop-* / --screen-* tokens, read from CSS.

   The DOM carousel is placed on the screen mesh with the same maths as three's
   CSS3DRenderer: this scene writes a CSS 3D camera transform (and the screen's
   matrix) every frame, so the DOM and the WebGL image line up exactly. */
const W = 1000;
const LID_D = 625;
const BASE_D = 640; // 15 behind the hinge for its housing
const BASE_T = 18;
const LID_T = 9;
const KEY_H = 6;
const PIVOT_Y = 4.6; // the closed lid rests on the keys
const FOCAL = 4500; // camera focal length in px: a gentle perspective, like a long lens
const DISPLAY = { w: 972, h: 597 };

type Tokens = Record<"alu" | "hinge" | "notch" | "camera" | "key" | "body" | "screen" | "glow", THREE.Color>;

const readTokens = (): Tokens => {
  const cs = getComputedStyle(document.documentElement);
  const c = (name: string) => new THREE.Color(cs.getPropertyValue(name).trim());
  return {
    alu: c("--laptop-deck-from").lerp(c("--laptop-deck-to"), 0.55), // the old gradient's middle: a mid silver
    hinge: c("--laptop-hinge"),
    notch: c("--laptop-notch"),
    camera: c("--laptop-camera"),
    key: c("--laptop-key"),
    body: c("--laptop-body"),
    screen: c("--screen-bg"),
    glow: c("--text"),
  };
};

/* A rounded-rectangle plate with bevelled edges, lying in the XZ plane, centred
   on the origin, thickness along y. `r` is the plan-view corner radius. */
function slab(w: number, d: number, t: number, r: number, b: number) {
  const iw = w - 2 * b;
  const id = d - 2 * b;
  const ir = Math.max(r - b, 0.5);
  const x = -iw / 2;
  const y = -id / 2;
  const s = new THREE.Shape();
  s.moveTo(x + ir, y);
  s.lineTo(x + iw - ir, y);
  s.absarc(x + iw - ir, y + ir, ir, -Math.PI / 2, 0, false);
  s.lineTo(x + iw, y + id - ir);
  s.absarc(x + iw - ir, y + id - ir, ir, 0, Math.PI / 2, false);
  s.lineTo(x + ir, y + id);
  s.absarc(x + ir, y + id - ir, ir, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + ir);
  s.absarc(x + ir, y + ir, ir, Math.PI, Math.PI * 1.5, false);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: t - 2 * b,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 5,
    curveSegments: 18,
  });
  g.rotateX(-Math.PI / 2);
  g.center();
  return toCreasedNormals(g, Math.PI / 5);
}

/* Key rows as widths in key units (15 across). */
const KEY_ROWS: { h: number; keys: number[] }[] = [
  { h: 28, keys: [1.5, ...Array(12).fill(1), 1.5] },
  { h: 46, keys: [...Array(13).fill(1), 2] },
  { h: 46, keys: [1.5, ...Array(12).fill(1), 1.5] },
  { h: 46, keys: [1.75, ...Array(11).fill(1), 2.25] },
  { h: 46, keys: [2.25, ...Array(10).fill(1), 2.75] },
  { h: 46, keys: [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1] },
];
const PITCH = 60;
const KEY_GAP = 7;
const ROW_GAP = 8;
const KEYS_Z0 = 52;

function layoutKeys() {
  const out: { x: number; z: number; sx: number; sz: number }[] = [];
  let z = KEYS_Z0;
  for (const row of KEY_ROWS) {
    let x = -(15 * PITCH) / 2;
    for (const u of row.keys) {
      const w = u * PITCH - KEY_GAP;
      out.push({ x: x + (u * PITCH) / 2, z: z + row.h / 2, sx: w / 50, sz: row.h / 46 });
      x += u * PITCH;
    }
    z += row.h + ROW_GAP;
  }
  return { keys: out, endZ: z - ROW_GAP };
}

function Keys({ color }: { color: THREE.Color }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { keys } = useMemo(() => layoutKeys(), []);
  const geometry = useMemo(() => new RoundedBoxGeometry(50, KEY_H, 46, 3, 3), []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    keys.forEach((k, i) => {
      m.compose(new THREE.Vector3(k.x, KEY_H / 2 + 0.4, k.z), new THREE.Quaternion(), new THREE.Vector3(k.sx, 1, k.sz));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [keys]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, keys.length]}>
      <meshPhysicalMaterial color={color} roughness={0.7} metalness={0} specularIntensity={0.3} envMapIntensity={0.1} />
    </instancedMesh>
  );
}

function logoTexture(color: THREE.Color) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const family = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
  ctx.font = `600 150px ${family}`;
  ctx.letterSpacing = "22px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.fillText("NICK.ODE", 512 + 11, 134);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* three's CSS3DRenderer matrices (the y flips turn y-up into CSS's y-down). */
const eps = (v: number) => (Math.abs(v) < 1e-10 ? 0 : v);
function cssCamera(e: number[]) {
  return `matrix3d(${[e[0], -e[1], e[2], e[3], e[4], -e[5], e[6], e[7], e[8], -e[9], e[10], e[11], e[12], -e[13], e[14], e[15]].map(eps).join(",")})`;
}
function cssObject(e: number[]) {
  return `translate(-50%,-50%) matrix3d(${[e[0], e[1], e[2], e[3], -e[4], -e[5], -e[6], -e[7], e[8], e[9], e[10], e[11], e[12], e[13], e[14], e[15]].map(eps).join(",")})`;
}

type Props = {
  progress: RefObject<SceneState>;
  place: (camera: string, object: string, w: number, h: number) => void;
  onReady: () => void;
  reduced: boolean;
};

function Laptop3D({ progress, place, onReady, reduced }: Props) {
  const laptop = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const tokens = useMemo(() => readTokens(), []);
  const { invalidate, gl, scene, camera } = useThree();

  // Clicking the keyboard (the base) shuts an open laptop; clicking a closed one opens it.
  const clickable = (part: "base" | "lid") => {
    const lidNow = progress.current.lid;
    return !reduced && (lidNow < 0.2 || (part === "base" && lidNow > 0.85));
  };
  const hit = (part: "base" | "lid") => ({
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!clickable(part)) return;
      e.stopPropagation();
      progress.current.click?.(part);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (clickable(part)) {
        e.stopPropagation();
        gl.domElement.style.cursor = "pointer";
      }
    },
    onPointerOut: () => {
      gl.domElement.style.cursor = "";
    },
  });
  const compiled = useRef(false);
  const ready = useRef(false);

  const base = useMemo(() => slab(W, BASE_D, BASE_T, 26, 3), []);
  const shell = useMemo(() => slab(W, LID_D, LID_T, 24, 2.5), []);
  const glass = useMemo(() => slab(W - 6, LID_D - 6, 1.4, 20, 0.5), []);
  const well = useMemo(() => slab(944, layoutKeys().endZ - KEYS_Z0 + 24, 0.8, 14, 0.3), []);
  const pad = useMemo(() => slab(400, 165, 0.8, 10, 0.3), []);
  const logo = useMemo(() => logoTexture(tokens.notch), [tokens]);
  const halo = useMemo(() => glowTexture(), []);
  const { endZ } = useMemo(() => layoutKeys(), []);

  // Follow the theme: the under-glow is --text, white on dark and dark on light.
  useEffect(() => {
    const mo = new MutationObserver(() => {
      tokens.glow.set(getComputedStyle(document.documentElement).getPropertyValue("--text").trim());
      invalidate();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => mo.disconnect();
  }, [tokens, invalidate]);

  // Compile every shader up front, off the main thread where the browser supports
  // it (KHR_parallel_shader_compile), so the first visible frame never stalls.
  useEffect(() => {
    let live = true;
    const done = () => {
      if (!live) return;
      compiled.current = true;
      invalidate();
    };
    gl.compileAsync(scene, camera).then(done, done); // a failed precompile just compiles on first draw

    return () => {
      live = false;
    };
  }, [gl, scene, camera, invalidate]);

  // Fonts may not be loaded when the logo is first drawn.
  useEffect(() => {
    document.fonts.ready.then(() => {
      const fresh = logoTexture(tokens.notch);
      logo.image = fresh.image;
      logo.needsUpdate = true;
      invalidate();
    });
  }, [logo, tokens, invalidate]);

  useFrame((state) => {
    const { camera, size, clock } = state;
    const t = clock.elapsedTime;
    const lidT = reduced ? 1 : progress.current.lid;
    const idle = reduced ? 0 : 1 - lidT;

    lid.current!.rotation.x = -THREE.MathUtils.degToRad(lerp(0, 90 + LID_OPEN, lidT));
    laptop.current!.rotation.y = THREE.MathUtils.degToRad(Math.sin(t * 0.35) * idle);
    light.current!.intensity = 0.3 * lidT;
    if (glow.current) glow.current.opacity = 0.3 * (0.7 + 0.3 * Math.sin(t * 0.8) * (reduced ? 0 : 1));

    // Camera: a long lens looking down TILT degrees at the hinge. The laptop sits
    // at Figma's size at a 1440 wide stage and scales with the width; the slide
    // into frame is the camera shifting up along its own vertical.
    const k = clamp(Math.min(size.width / 1440, size.height / 900), 0.5, 1.35); // fit both ways
    const dist = FOCAL / k;
    const dy = lerp(CLOSED_DROP, 0, lidT) + Math.sin(t * 0.5) * 4 * idle;
    const up = 23 / k + 225 + dy;
    const el = THREE.MathUtils.degToRad(TILT);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.radToDeg(2 * Math.atan(size.height / 2 / FOCAL));
    const target = new THREE.Vector3(0, Math.cos(el) * up, -Math.sin(el) * up);
    perspective.position.set(target.x, target.y + Math.sin(el) * dist, target.z + Math.cos(el) * dist);
    perspective.lookAt(target);
    perspective.updateProjectionMatrix();
    perspective.updateMatrixWorld();

    // Place the DOM screen: the CSS 3D camera and the screen's matrix.
    state.scene.updateMatrixWorld();
    const fov = perspective.projectionMatrix.elements[5] * (size.height / 2);
    place(
      `perspective(${fov}px) translateZ(${fov}px) ${cssCamera(perspective.matrixWorldInverse.elements)} translate(${size.width / 2}px,${size.height / 2}px)`,
      cssObject(screen.current!.matrixWorld.elements),
      size.width,
      size.height,
    );

    // Ready once a compiled frame is on screen: the carousel waits for this.
    if (compiled.current && !ready.current) {
      ready.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[300, 900, 700]} intensity={0.6} />
      <directionalLight position={[-600, 300, -400]} intensity={0.5} />

      <group ref={laptop}>
        {/* under-glow / shadow */}
        <mesh position={[0, -90, 320]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1} raycast={() => null}>
          <planeGeometry args={[1400, 900]} />
          <meshBasicMaterial ref={glow} map={halo} color={tokens.glow} transparent opacity={0.3} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* base: deck, keys, trackpad, hinge */}
        <group {...hit("base")}>
        <mesh geometry={base} position={[0, -BASE_T / 2, BASE_D / 2 - 15]}>
          <meshPhysicalMaterial color={tokens.alu} metalness={1} roughness={0.32} envMapIntensity={1.1} />
        </mesh>
        <mesh geometry={well} position={[0, 0.4, KEYS_Z0 - 12 + (endZ - KEYS_Z0 + 24) / 2]}>
          <meshPhysicalMaterial color={tokens.body} roughness={0.7} metalness={0} />
        </mesh>
        <Keys color={tokens.key} />
        <mesh geometry={pad} position={[0, 0.4, 487]}>
          <meshPhysicalMaterial color={tokens.alu} metalness={1} roughness={0.12} envMapIntensity={1.2} />
        </mesh>
        <mesh position={[0, 0.2, LID_D - 7]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[150, 9]} />
          <meshStandardMaterial color={tokens.notch} roughness={0.7} />
        </mesh>
        {/* hinge */}
        <mesh position={[0, 3, -2]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[6.5, 6.5, 860, 24]} />
          <meshStandardMaterial color={tokens.hinge} metalness={0.9} roughness={0.4} />
        </mesh>
        </group>

        {/* lid: pivots about the hinge; local y is out of the back, -y out of the screen */}
        <group ref={lid} position={[0, PIVOT_Y, 0]} {...hit("lid")}>
          <mesh geometry={shell} position={[0, LID_T / 2, LID_D / 2]}>
            <meshPhysicalMaterial color={tokens.alu} metalness={1} roughness={0.3} envMapIntensity={1.1} />
          </mesh>
          <mesh position={[0, LID_T + 0.1, LID_D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[560, 140]} />
            <meshBasicMaterial map={logo} transparent depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh geometry={glass} position={[0, -0.7, LID_D / 2]}>
            <meshPhysicalMaterial color={tokens.body} roughness={0.14} metalness={0} clearcoat={1} clearcoatRoughness={0.06} envMapIntensity={0.7} />
          </mesh>
          <mesh position={[0, -1.6, LID_D - 8]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3, 20]} />
            <meshStandardMaterial color={tokens.camera} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* the screen: its own frame has +z out of the glass and +y toward the top of the lid */}
          <group ref={screen} position={[0, -1.5, LID_D / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <planeGeometry args={[DISPLAY.w, DISPLAY.h]} />
              <meshBasicMaterial color={tokens.screen} toneMapped={false} />
            </mesh>
          </group>
          <pointLight ref={light} position={[0, -260, LID_D / 2]} decay={0} color="white" />
        </group>
      </group>

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 7, 1]} rotation-x={Math.PI / 2} scale={[16, 8, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[-8, 2, 3]} rotation-y={Math.PI / 2} scale={[9, 5, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[8, 3, 2]} rotation-y={-Math.PI / 2} scale={[9, 5, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[0, 1.5, 9]} rotation-y={Math.PI} scale={[18, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 4, -10]} scale={[30, 9, 1]} />
      </Environment>
    </>
  );
}

export default function LaptopScene({
  progress,
  place,
  active,
  onReady,
}: Omit<Props, "reduced"> & { active: boolean }) {
  const reduced = useMemo(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);
  return (
    <Canvas
      // Mounted early (idle preload) but off screen: "demand" renders the first
      // frames so everything is compiled and baked before the section arrives.
      frameloop={reduced || !active ? "demand" : "always"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ near: 50, far: 20000, fov: 10, position: [0, 0, FOCAL] }}
      onCreated={({ invalidate }) => {
        // demand mode: the environment map and fonts settle after the first frame
        [60, 300, 900].forEach((ms) => setTimeout(invalidate, ms));
      }}
    >
      <Laptop3D progress={progress} place={place} onReady={onReady} reduced={reduced} />
    </Canvas>
  );
}
