"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { detailsFor, type Achievement } from "@/content/achievements";
import { useModalDialog } from "@/lib/useModalDialog";

/* Achievement modals (DESIGN.md 7.6.1 and 7.6.2, Figma 18:2 and 18:176).
   One shell on a native <dialog> opened with showModal(), which gives a real
   focus trap, an inert page behind it and Esc for free. Certificates and awards
   get the certificate sheet (click to zoom); events get a photo carousel
   (arrow keys, swipe, thumbnails). Focus returns to the card that opened it. */
type Props = {
  achievement: Achievement | null;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

export function AchievementModal({ achievement, triggerRef, onClose }: Props) {
  const dialogRef = useModalDialog(!!achievement, triggerRef);
  const titleId = useId();
  // Keep the last achievement mounted while the closing animation plays.
  const [shown, setShown] = useState<Achievement | null>(achievement);
  if (achievement && achievement !== shown) setShown(achievement);
  const [zoomId, setZoomId] = useState<string | null>(null);
  const zoomed = !!shown && zoomId === shown.id;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`achv-dialog ${achievement ? "" : "is-closing"}`}
      onCancel={(e) => {
        // Esc: close the zoom first, then the modal.
        e.preventDefault();
        if (zoomed) setZoomId(null);
        else onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // the scrim
      }}
    >
      {shown && (
        <ModalPanel
          key={shown.id}
          a={shown}
          titleId={titleId}
          zoomed={zoomed}
          setZoomed={(z) => setZoomId(z ? shown.id : null)}
          onClose={onClose}
        />
      )}
    </dialog>
  );
}

function ModalPanel({
  a,
  titleId,
  zoomed,
  setZoomed,
  onClose,
}: {
  a: Achievement;
  titleId: string;
  zoomed: boolean;
  setZoomed: (z: boolean) => void;
  onClose: () => void;
}) {
  const isEvent = a.kind === "event";
  return (
    <div className="achv-panel relative flex h-[680px] w-[1120px] max-w-[calc(100vw-48px)] overflow-hidden rounded-marquee border border-border-strong bg-surface shadow-[0_24px_60px_0_var(--shadow-modal)]">
      <div className="relative h-full w-[600px] shrink-0 overflow-hidden [background:linear-gradient(123.57deg,var(--media-from)_0%,var(--media-to)_71.429%)]">
        {isEvent ? (
          <EventMedia a={a} />
        ) : (
          <CertificateMedia a={a} onZoom={() => setZoomed(true)} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[22px] px-10 pb-10 pt-12">
        <div className="flex flex-wrap gap-2">
          {a.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-control border border-border-strong px-3 py-[7px] font-display text-[11px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-2"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2
          id={titleId}
          className="font-display text-[34px] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text"
        >
          {a.title}
        </h2>
        <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-[18px]">
          {detailsFor(a).map(({ label, value }) => (
            <div key={label} className="flex min-w-0 flex-col gap-[6px]">
              <dt className="font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
                {label}
              </dt>
              <dd className="text-[16px] leading-[1.7] text-text">{value}</dd>
            </div>
          ))}
        </dl>
        <div aria-hidden className="h-px w-full shrink-0 bg-border" />
        <p className="text-[17px] leading-[1.7] text-text-2">{a.description}</p>

        <div className="flex-1" />

        {a.verifyUrl && !isEvent && (
          <a
            href={a.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text"
          >
            Verify credential
            <MaskIcon name="arrow-up-right" width={14} />
          </a>
        )}
        <p className="font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
          {isEvent ? "See the post" : "Shared on"}
        </p>
        <SocialRow a={a} />
      </div>

      <button
        type="button"
        autoFocus
        onClick={onClose}
        aria-label="Close"
        className="absolute right-[25px] top-[23px] z-10 flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-(--overlay-btn) text-text transition-colors duration-300 hover:border-text"
      >
        <MaskIcon name="close" />
      </button>

      {zoomed && (
        <button
          type="button"
          autoFocus
          aria-label="Close zoomed certificate"
          onClick={() => setZoomed(false)}
          className="absolute inset-0 z-20 flex cursor-zoom-out items-center justify-center bg-[color-mix(in_srgb,var(--surface)_96%,transparent)]"
        >
          <CertificateSheet a={a} scale={1.9} />
        </button>
      )}
    </div>
  );
}

/* ---- certificate ---------------------------------------------------------- */

function splitTitle(title: string): [string, string?] {
  const i = title.toLowerCase().indexOf(" for ");
  return i > 0 ? [title.slice(0, i), `For ${title.slice(i + 5)}`] : [title];
}

/* The sheet is always a light sheet with dark ink (section 3's one exception),
   so its colors live in .cert-sheet, not in tokens. */
function CertificateSheet({ a, scale = 1 }: { a: Achievement; scale?: number }) {
  const [first, second] = splitTitle(a.title);
  return (
    <div
      className="cert-sheet relative h-[340px] w-[480px] shrink-0 overflow-hidden rounded-[4px]"
      style={{ transform: `scale(${scale})` }}
    >
      {a.image ? (
        <Image src={a.image} alt={`${a.title} certificate`} fill unoptimized className="object-contain" />
      ) : (
        <>
          <p className="absolute inset-x-0 top-[44px] text-center font-display text-[11px] font-normal uppercase leading-[1.4] tracking-[0.18em]">
            Certificate of completion
          </p>
          <p className="absolute inset-x-[40px] top-[84px] text-center font-display text-[28px] font-medium uppercase leading-[1.2] tracking-[0.03em]">
            {first}
          </p>
          {second && (
            <p className="absolute inset-x-[40px] top-[126px] text-center font-display text-[18px] font-medium uppercase leading-[1.2] tracking-[0.03em]">
              {second}
            </p>
          )}
          <div className="cert-line absolute left-[60px] top-[270px] h-px w-[200px]" />
          <p className="absolute left-[60px] top-[280px] font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em]">
            Your name
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icons/seal.svg" alt="" className="absolute left-[356px] top-[250px] size-16" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/icons/seal-inner.svg" alt="" className="absolute left-[368px] top-[262px] size-10" />
        </>
      )}
    </div>
  );
}

function CertificateMedia({ a, onZoom }: { a: Achievement; onZoom: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onZoom}
        aria-label="Zoom certificate"
        className="absolute left-[60px] top-[150px] cursor-zoom-in"
      >
        <CertificateSheet a={a} />
      </button>
      <p className="absolute inset-x-0 top-[518px] whitespace-pre text-center font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
        {"CERTIFICATE IMAGE  ·  CLICK TO ZOOM"}
      </p>
      <button
        type="button"
        onClick={onZoom}
        aria-label="Zoom certificate"
        className="absolute left-[532px] top-[612px] flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-(--overlay-btn) text-text transition-colors duration-300 hover:border-text"
      >
        <MaskIcon name="expand" />
      </button>
    </>
  );
}

/* ---- event carousel -------------------------------------------------------- */

const SWIPE_PX = 48;
const pad = (n: number) => String(n).padStart(2, "0");

function EventMedia({ a }: { a: Achievement }) {
  const count = a.photos?.length || 5;
  const [index, setIndex] = useState(count > 1 ? 1 : 0); // Figma shows photo 2 of 5
  const startX = useRef<number | null>(null);

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const down = (e: PointerEvent) => {
    startX.current = e.clientX;
  };
  const up = (e: PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1);
  };

  const photo = a.photos?.[index];

  return (
    <div
      className="absolute inset-0 touch-pan-y select-none"
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={() => (startX.current = null)}
    >
      {photo ? (
        <Image src={photo} alt={`${a.title}, photo ${index + 1} of ${count}`} fill unoptimized className="object-cover" />
      ) : (
        <div
          role="img"
          aria-label={`Photo ${index + 1} of ${count} (placeholder)`}
          className="absolute inset-x-0 top-[290px] flex flex-col items-center gap-[10px] text-text-muted"
        >
          <MaskIcon name="image" width={48} height={38} />
          <p className="whitespace-pre font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em]">
            {`EVENT PHOTO  ·  ${index + 1} OF ${count}`}
          </p>
        </div>
      )}

      <p
        aria-live="polite"
        className="absolute left-6 top-6 rounded-[20px] bg-(--overlay-btn) px-[14px] py-2 font-display text-[12px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text"
      >
        {pad(index + 1)} / {pad(count)}
      </p>

      {(
        [
          ["Previous photo", -1, "arrow-left", "left-6"],
          ["Next photo", 1, "arrow-right", "right-6"],
        ] as const
      ).map(([label, delta, icon, side]) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          onClick={() => go(delta)}
          className={`absolute ${side} top-[296px] flex size-12 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-(--overlay-btn) text-text transition-colors duration-300 hover:border-text`}
        >
          <MaskIcon name={icon} />
        </button>
      ))}

      <div className="absolute inset-x-0 top-[594px] flex justify-center gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`relative h-[58px] w-[84px] cursor-pointer overflow-hidden rounded-[6px] transition-opacity duration-300 ${
              i === index ? "border-2 border-text" : "border border-border opacity-60 hover:opacity-100"
            }`}
            style={{ background: `color-mix(in srgb, var(--text) ${16 + i * 3}%, var(--bg))` }}
          >
            {a.photos?.[i] && <Image src={a.photos[i]} alt="" fill unoptimized className="object-cover" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- sharing ---------------------------------------------------------------- */

const round =
  "flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-strong text-text transition-colors duration-300 hover:border-text";

function SocialRow({ a }: { a: Achievement }) {
  const [copied, setCopied] = useState(false);
  const link = (url?: string) => url ?? "#";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(a.posts.linkedin && a.posts.linkedin !== "#" ? a.posts.linkedin : window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the button just does nothing.
    }
  };

  const social: [string, string, string | undefined][] = [
    ["Facebook", "facebook", a.posts.facebook],
    ["Instagram", "instagram", a.posts.instagram],
  ];

  return (
    <div className="flex items-center gap-3">
      <a
        href={link(a.posts.linkedin)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-[10px] rounded-control bg-text px-6 py-[14px] font-display text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-inverse"
      >
        <MaskIcon name="linkedin" />
        LinkedIn post
        <MaskIcon name="arrow-up-right" width={14} />
      </a>
      {social.map(([label, icon, url]) => (
        <a
          key={icon}
          href={link(url)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} post`}
          className={round}
        >
          <MaskIcon name={icon} />
        </a>
      ))}
      <button type="button" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"} className={round}>
        <MaskIcon name="link" />
      </button>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

