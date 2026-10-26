"use client";

import { useEffect, useRef } from "react";

/* Animated Great Wave. The print is one flat image, so it cannot crash or curl
   the way a layered illustration could; instead a fragment shader flows the
   whole sea surface: ripples travelling across the water, a slow swell that
   lifts and lowers it, and a much calmer sky and crest. Still grayscale, still
   Hokusai's linework, just alive.

   Each half of the split scene renders only its own half of the picture (the
   canvas is half the wave element wide) and both read the same clock, so they
   stay in step across the seam. The static <img> underneath is the fallback
   when WebGL2 is missing or motion is reduced. */
const SRC = { dark: "/assets/wave/great-wave-dark.webp", light: "/assets/wave/great-wave-light.webp" };
const IMAGE_ASPECT = 1920 / 1291;
const MAX_DPR = 1.5;

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform float uTime;
uniform float uSide;      // 0 = left half of the scene, 1 = right half
uniform vec2 uAspect;     // x: wave element aspect, y: image aspect
in vec2 vUv;
out vec4 outColor;

void main() {
  // Position in the whole wave element, then the same object-fit: cover the
  // static image uses.
  vec2 q = vec2(uSide * 0.5 + vUv.x * 0.5, vUv.y);
  vec2 uv = q;
  if (uAspect.x > uAspect.y) uv.y = 0.5 + (q.y - 0.5) * (uAspect.y / uAspect.x);
  else uv.x = 0.5 + (q.x - 0.5) * (uAspect.x / uAspect.y);

  // Calm up in the sky and crest, livelier down in the sea.
  float live = 0.15 + 0.85 * smoothstep(0.26, 0.78, uv.y);
  float t = uTime;
  vec2 d;
  d.x = 0.0068 * sin(uv.y * 31.0 + t * 0.85 + 1.8 * sin(uv.x * 6.5 - t * 0.32))
      + 0.0022 * sin(uv.y * 97.0 - t * 1.35 + uv.x * 13.0);
  d.y = 0.0056 * sin(uv.x * 23.0 + t * 0.62 + 1.4 * sin(uv.y * 8.0 + t * 0.27))
      + 0.0018 * sin(uv.x * 71.0 - t * 1.1 + uv.y * 17.0);
  // The whole sea slowly lifts and lowers.
  d.y += 0.0070 * sin(uv.x * 3.2 - t * 0.55);
  uv += d * live;

  float g = texture(uTex, uv).r;
  outColor = vec4(g, g, g, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

export function WaveCanvas({ side }: { side: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link failed");
    } catch {
      return; // the static image stays
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "uTime");
    const uSide = gl.getUniformLocation(program, "uSide");
    const uAspect = gl.getUniformLocation(program, "uAspect");
    gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);
    gl.uniform1f(uSide, side === "left" ? 0 : 1);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const stage = canvas.closest<HTMLElement>(".about-stage");
    let ready = false;
    let visible = false;
    let frame = 0;
    let disposed = false;
    let loadId = 0;

    const loadTexture = () => {
      const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const id = ++loadId;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (disposed || id !== loadId) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        ready = true;
      };
      img.src = SRC[theme];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      // The canvas is half the wave element, so the element is twice as wide.
      gl.uniform2f(uAspect, (canvas.clientWidth * 2) / Math.max(1, canvas.clientHeight), IMAGE_ASPECT);
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!ready || !visible || document.hidden || stage?.dataset.waveLive === "0") return;
      gl.uniform1f(uTime, (now / 1000) % 3600);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.style.opacity = "1"; // fade in over the static image after the first frame
    };

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const themeObserver = new MutationObserver(loadTexture);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onLost = (e: Event) => {
      e.preventDefault();
      canvas.style.opacity = "0"; // back to the static image
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    resize();
    loadTexture();
    frame = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // No loseContext(): a canvas hands back its old context on the next
      // getContext(), so killing it would break React's dev double-mount.
    };
  }, [side]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute top-0 h-full w-1/2 opacity-0 transition-opacity duration-700 ${
        side === "left" ? "left-0" : "left-1/2"
      }`}
    />
  );
}
