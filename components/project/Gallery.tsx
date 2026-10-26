"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Project } from "@/content/projects";
import { useModalDialog } from "@/lib/useModalDialog";

/* Screenshots (DESIGN.md 8.5, Figma 16:34): one wide and one narrow card, then
   rows of three. Each opens a lightbox with prev/next (arrow keys too). With no
   images yet (placeholder data) the cards show the image glyph and the lightbox
   shows the same placeholder at a larger size. */
type Shot = Project["screenshots"][number];

const Card = ({
  shot,
  index,
  className,
  onOpen,
}: {
  shot: Shot;
  className: string;
  index: number;
  onOpen: (i: number, el: HTMLElement) => void;
}) => (
  <button
    type="button"
    onClick={(e) => onOpen(index, e.currentTarget)}
    aria-label={`Open ${shot.caption.toLowerCase()}`}
    className={`group relative block cursor-zoom-in overflow-hidden rounded-card border border-border text-left transition-colors duration-300 hover:border-border-strong ${className}`}
    style={{
      background: "linear-gradient(135deg, var(--media-from), var(--media-to))",
    }}
  >
    {shot.src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={shot.src}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
    ) : (
      <MaskIcon
        name="image"
        width={40}
        height={32}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+8px)] text-text-muted"
      />
    )}
    <span className="absolute bottom-6 left-6 font-display text-[11px] uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
      {shot.caption}
    </span>
  </button>
);

type LightboxProps = {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  shots: Shot[];
  at: number;
  setAt: Dispatch<SetStateAction<number>>;
  onClose: () => void;
};

function Lightbox({
  open,
  triggerRef,
  shots,
  at,
  setAt,
  onClose,
}: LightboxProps) {
  const dialogRef = useModalDialog(open, triggerRef);
  const n = shots.length;
  const shot = shots[at];
  const step = (d: number) => setAt((i) => (i + d + n) % n);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <dialog
      ref={dialogRef}
      aria-label="Screenshot viewer"
      className={`achv-dialog ${open ? "" : "is-closing"}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="achv-panel relative w-[min(1200px,calc(100vw-48px))]">
        <div
          className="relative aspect-video w-full overflow-hidden rounded-card border border-border-strong"
          style={{
            background:
              "linear-gradient(135deg, var(--media-from), var(--media-to))",
          }}
        >
          {shot?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shot.src}
              alt={shot.caption}
              className="absolute inset-0 size-full object-contain"
            />
          ) : (
            <MaskIcon
              name="image"
              width={64}
              height={51}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-text-muted"
            />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between font-display text-[12px] uppercase leading-[1.4] tracking-[0.18em] text-text-2">
          <span>{shot?.caption}</span>
          <span aria-live="polite">
            {String(at + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => onClose()}
          className="absolute right-4 top-4 flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-(--overlay-btn) text-text transition-colors duration-300 hover:border-text"
        >
          <MaskIcon name="close" width={16} />
        </button>
        {(
          [
            ["Previous screenshot", -1, "arrow-left", "left-4"],
            ["Next screenshot", 1, "arrow-right", "right-4"],
          ] as const
        ).map(([label, d, icon, side]) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={() => step(d)}
            className={`absolute top-[calc(50%-40px)] flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-(--overlay-btn) text-text transition-colors duration-300 hover:border-text ${side}`}
          >
            <MaskIcon name={icon} width={18} />
          </button>
        ))}
      </div>
    </dialog>
  );
}

export function Gallery({ screenshots }: { screenshots: Shot[] }) {
  const [isOpen, setOpen] = useState(false);
  const [at, setAt] = useState(0); // stays put while the lightbox animates out
  const triggerRef = useRef<HTMLElement | null>(null);

  const openAt = (i: number, el: HTMLElement) => {
    triggerRef.current = el;
    setAt(i);
    setOpen(true);
  };
  const [a, b, ...rest] = screenshots;

  return (
    <div>
      <SectionHeader eyebrow="03 — GALLERY" title="SCREENSHOTS" />
      <div className="mt-12 flex flex-col gap-12 px-[var(--gutter)]">
        <div className="grid gap-6 lg:grid-cols-[772fr_404fr]">
          {a && (
            <Card
              shot={a}
              index={0}
              onOpen={openAt}
              className="h-[300px] lg:h-[440px]"
            />
          )}
          {b && (
            <Card
              shot={b}
              index={1}
              onOpen={openAt}
              className="h-[300px] lg:h-[440px]"
            />
          )}
        </div>
        {rest.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((s, i) => (
              <Card
                key={s.caption}
                shot={s}
                index={i + 2}
                onOpen={openAt}
                className="h-[300px]"
              />
            ))}
          </div>
        )}
      </div>

      <Lightbox
        open={isOpen}
        triggerRef={triggerRef}
        shots={screenshots}
        at={at}
        setAt={setAt}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
