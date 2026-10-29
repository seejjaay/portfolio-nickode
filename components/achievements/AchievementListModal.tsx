"use client";

import { useId, useMemo, useState, type RefObject } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { achievements, type Achievement } from "@/content/achievements";
import { useModalDialog } from "@/lib/useModalDialog";

/* "See more" modal: every certificate, award and event in one scrollable list,
   newest first, with filter chips. There is no Figma frame for it, so it reuses
   the achievement modal's shell and tokens (panel, scrim, close button, tag and
   chip styles). Picking a row opens that item's detail modal on top of this
   one; closing the detail returns here. */
type Kind = Achievement["kind"];
type Filter = "all" | Kind;

const KINDS: { kind: Kind; label: string }[] = [
  { kind: "certificate", label: "Certificates" },
  { kind: "award", label: "Awards" },
  { kind: "event", label: "Events" },
];
const FILTERS: { value: Filter; label: string }[] = [{ value: "all", label: "All" }, ...KINDS.map(({ kind, label }) => ({ value: kind, label }))];

// Newest first; Array.sort is stable, so the order within a year is the data order.
const newestFirst = [...achievements].sort((a, b) => Number(b.year) - Number(a.year));

type Props = {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onSelect: (a: Achievement, trigger: HTMLElement) => void;
};

export function AchievementListModal({ open, triggerRef, onClose, onSelect }: Props) {
  const dialogRef = useModalDialog(open, triggerRef);
  const titleId = useId();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => Object.fromEntries(KINDS.map(({ kind }) => [kind, achievements.filter((a) => a.kind === kind).length])) as Record<Kind, number>,
    [],
  );
  const groups = KINDS.filter(({ kind }) => filter === "all" || filter === kind)
    .map(({ kind, label }) => ({ label, items: newestFirst.filter((a) => a.kind === kind) }))
    .filter((g) => g.items.length > 0);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`achv-dialog ${open ? "" : "is-closing"}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // the scrim
      }}
    >
      <div className="achv-panel relative flex h-[680px] max-h-[calc(100dvh-48px)] w-[880px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-marquee border border-border-strong bg-surface shadow-[0_24px_60px_0_var(--shadow-modal)]">
        <div className="flex shrink-0 flex-col gap-4 px-12 pb-5 pt-11">
          <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
            05 — Achievements
          </p>
          <h2
            id={titleId}
            className="font-display text-[34px] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text"
          >
            All achievements
          </h2>
          <p className="text-[16px] leading-[1.7] text-text-2">
            {counts.certificate} certificates · {counts.award} awards · {counts.event} events
          </p>
          <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(value)}
                  className={`cursor-pointer rounded-control border px-3 py-[7px] font-display text-[11px] font-medium uppercase leading-[1.4] tracking-[0.12em] transition-colors duration-300 ${
                    active
                      ? "border-text bg-text text-text-inverse"
                      : "border-border-strong text-text-2 hover:border-text hover:text-text"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div aria-hidden className="mx-12 h-px shrink-0 bg-border" />

        <div data-lenis-prevent className="achv-list min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-2">
          {groups.map(({ label, items }) => (
            <section key={label} aria-label={label} className="mt-6 first:mt-4">
              <h3 className="px-4 pb-2 font-display text-[11px] font-medium uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
                {label} · {items.length}
              </h3>
              <ul className="flex flex-col gap-1">
                {items.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={(e) => onSelect(a, e.currentTarget)}
                      className="group flex w-full cursor-pointer items-center gap-5 rounded-card border border-transparent px-4 py-3 text-left transition-colors duration-300 hover:border-border-strong hover:bg-surface-hover"
                    >
                      <span
                        aria-hidden
                        className="size-14 shrink-0 rounded-control border border-border [background:linear-gradient(to_bottom,var(--thumb-from),var(--thumb-to))]"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="whitespace-pre-wrap font-display text-[10px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
                          {`${a.kind.toUpperCase()}  ·  ${a.issuer.toUpperCase()}  ·  ${a.year}`}
                        </span>
                        <span className="font-display text-[19px] font-medium leading-[1.2] tracking-[0.03em] text-text">
                          {a.title}
                        </span>
                      </span>
                      <MaskIcon
                        name="arrow-up-right"
                        width={14}
                        className="text-text-muted transition-colors duration-300 group-hover:text-text"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
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
      </div>
    </dialog>
  );
}
