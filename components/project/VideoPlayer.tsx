"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import type { Project } from "@/content/projects";

/* Project demo (DESIGN.md 8.2, Figma 15:53): a 16:9 card with a native <video>
   under custom controls. With no clip yet (the placeholder data) it shows the
   same card over the placeholder art and the play button does nothing. */
const RINGS = [260, 420, 580, 740];

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const parse = (d: string) => d.split(":").reduce((a, n) => a * 60 + Number(n), 0);

export function VideoPlayer({ video, title }: { video: Project["video"]; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(parse(video.duration));
  const live = !!video.src;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => Number.isFinite(v.duration) && setLength(v.duration);
    const onState = () => setPlaying(!v.paused);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("play", onState);
    v.addEventListener("pause", onState);
    v.addEventListener("ended", onState);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("play", onState);
      v.removeEventListener("pause", onState);
      v.removeEventListener("ended", onState);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };
  const seek = (e: PointerEvent<HTMLDivElement>) => {
    const v = ref.current;
    if (!v || !length) return;
    const r = e.currentTarget.getBoundingClientRect();
    v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * length;
  };
  const progress = length ? Math.min(1, time / length) : 0;

  return (
    <div
      ref={boxRef}
      className="video-card relative aspect-video overflow-hidden rounded-card border border-border"
      style={{ background: "linear-gradient(135deg, var(--media-from), var(--media-to))" }}
    >
      {live ? (
        <video
          ref={ref}
          src={video.src}
          poster={video.poster || undefined}
          preload="metadata"
          muted={muted}
          playsInline
          aria-label={`${title} demo video`}
          className="absolute inset-0 size-full object-cover"
          onClick={toggle}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {RINGS.map((d) => (
            <span
              key={d}
              className="absolute left-1/2 top-1/2 rounded-full border border-border"
              style={{ width: d, height: d, translate: "-50% -50%" }}
            />
          ))}
        </div>
      )}

      <p className="absolute left-8 top-7 font-display text-[12px] uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
        PROJECT DEMO · {video.duration}
      </p>

      <button
        type="button"
        onClick={toggle}
        disabled={!live}
        aria-label={playing ? "Pause demo video" : live ? "Play demo video" : "Demo video coming soon"}
        className={`absolute left-1/2 top-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-text text-text-inverse transition-[transform,opacity] duration-300 ease-brand enabled:cursor-pointer enabled:hover:scale-105 motion-reduce:transition-none ${
          playing ? "opacity-0 hover:opacity-100 focus-visible:opacity-100" : ""
        }`}
      >
        {playing ? (
          <span aria-hidden className="flex gap-[6px]">
            <span className="h-7 w-[7px] bg-current" />
            <span className="h-7 w-[7px] bg-current" />
          </span>
        ) : (
          <MaskIcon name="play" width={26} height={30} className="ml-1" />
        )}
      </button>

      <div className="absolute inset-x-8 bottom-6">
        <div role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={Math.round(length)} aria-valuenow={Math.round(time)} onPointerDown={live ? seek : undefined} className="group relative flex h-3 cursor-pointer items-center">
          <span className="h-[3px] w-full bg-border-strong" />
          <span className="absolute left-0 h-[3px] bg-text" style={{ width: `${progress * 100}%` }} />
          <span className="absolute size-3 -translate-x-1/2 rounded-full bg-text" style={{ left: `${progress * 100}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between font-display text-[12px] leading-[1.4] tracking-[0.06em] text-text-2">
          <span>
            {clock(time)} / {clock(length)}
          </span>
          <span className="flex items-center gap-6">
            <button type="button" aria-label={muted ? "Unmute" : "Mute"} aria-pressed={muted} onClick={() => setMuted((m) => !m)} className={`text-text ${muted ? "opacity-50" : ""}`}>
              <MaskIcon name="volume" width={20} />
            </button>
            <button type="button" aria-label="Fullscreen" onClick={() => boxRef.current?.requestFullscreen?.()} className="text-text">
              <MaskIcon name="expand" width={20} />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
