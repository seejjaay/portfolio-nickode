"use client";

import { useRef, type RefObject } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { useModalDialog } from "@/lib/useModalDialog";
import { NetworkCanvas } from "./NetworkCanvas";

/* The expand button's larger view (DESIGN.md 7.5): the finished network, draggable,
   in the same dialog shell as the achievement modals. */
type Props = {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  label: string;
};

export function NetworkModal({ open, triggerRef, onClose, label }: Props) {
  const dialogRef = useModalDialog(open, triggerRef);
  const done = useRef({ p: 1 });

  return (
    <dialog
      ref={dialogRef}
      aria-label="Tech stack network"
      className={`achv-dialog ${open ? "" : "is-closing"}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="achv-panel relative h-[calc(100dvh-48px)] w-[calc(100vw-48px)] max-w-[1280px] overflow-hidden rounded-marquee border border-border-strong bg-bg shadow-[0_24px_60px_0_var(--shadow-modal)]">
        {open && <NetworkCanvas progress={done} label={label} className="absolute inset-0" />}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-[25px] top-[23px] z-10 flex size-10 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-(--overlay-btn) text-text transition-colors duration-300 hover:border-text"
        >
          <MaskIcon name="close" width={16} />
        </button>
        <p className="nw-hint pointer-events-none absolute bottom-3 left-0 right-0 text-center">
          DRAG TO ROTATE<span className="nw-hint-touch"> · TAP A LOGO</span>
        </p>
      </div>
    </dialog>
  );
}
