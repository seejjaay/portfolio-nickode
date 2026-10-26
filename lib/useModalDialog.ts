"use client";

import { useEffect, useRef, type RefObject } from "react";
import { lockScroll } from "@/lib/scroll";

const CLOSE_MS = 260; // matches the achv-out animation in globals.css

/* Open/close plumbing for a native <dialog> used as a modal: showModal() when
   `open` turns true (focus trap, inert page, Esc), a short exit animation when
   it turns false, then close(), a counted page-scroll lock, and focus returned
   to whatever opened it. Works for stacked dialogs: the lock is released only
   when the last one closes. Returns the ref to put on the <dialog>. */
export function useModalDialog(open: boolean, triggerRef: RefObject<HTMLElement | null>) {
  const ref = useRef<HTMLDialogElement>(null);
  const release = useRef<(() => void) | null>(null);

  useEffect(() => {
    const dialog = ref.current!;
    if (open) {
      if (!dialog.open) dialog.showModal();
      if (!release.current) release.current = lockScroll();
      return;
    }
    if (!dialog.open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        dialog.close();
        release.current?.();
        release.current = null;
        triggerRef.current?.focus();
      },
      reduced ? 0 : CLOSE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [open, triggerRef]);

  useEffect(
    () => () => {
      release.current?.();
      release.current = null;
    },
    [],
  );

  return ref;
}
