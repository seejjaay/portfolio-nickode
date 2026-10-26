"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AchievementModal } from "@/components/achievements/AchievementModal";
import { MaskIcon } from "@/components/ui/MaskIcon";
import type { Achievement } from "@/content/achievements";
import type { RelatedItem, Role } from "@/content/experience";

/* Experience accordion (DESIGN.md 7.7, Figma 19:80 / 3:29). One role open at a
   time, the first by default; the body opens by animating its grid row from 0fr
   to 1fr (400ms, --ease) so no height is measured. Each header is a real button
   with aria-expanded / aria-controls; a closed body is inert, so nothing in it
   is focusable. Project cards link to the project page, event cards open the
   event modal. */
const cardBase =
  "flex w-full flex-col items-start gap-[10px] rounded-card border border-border bg-[color-mix(in_srgb,var(--text)_5%,transparent)] p-5 text-left transition-colors duration-300 hover:border-border-strong";

function RelatedCard({
  item,
  onOpenEvent,
}: {
  item: RelatedItem;
  onOpenEvent: (e: Achievement, trigger: HTMLElement) => void;
}) {
  const isProject = item.type === "project";
  const inner = (
    <>
      <span className="flex w-full items-center gap-3">
        <span
          className={`flex items-center rounded-control px-[10px] py-[5px] font-display text-[10px] font-medium uppercase leading-[1.4] tracking-[0.12em] ${
            isProject ? "bg-text text-text-inverse" : "border border-text text-text"
          }`}
        >
          {isProject ? "Project" : "Event"}
        </span>
        <span className="font-display text-[11px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-muted">
          {item.date}
        </span>
        <span className="flex-1" />
        <MaskIcon name="arrow-up-right" width={14} className="text-text" />
      </span>
      <span className="block w-full font-display text-[20px] font-medium leading-[1.2] tracking-[0.03em] text-text">
        {item.title}
      </span>
      <span className="block w-full text-[14px] leading-[1.7] text-text-2">{item.text}</span>
    </>
  );

  return isProject ? (
    <Link href={`/projects/${item.slug}`} className={cardBase}>
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(e) => onOpenEvent(item.event, e.currentTarget)}
      className={`${cardBase} cursor-pointer`}
    >
      {inner}
    </button>
  );
}

function RoleItem({
  role,
  open,
  onToggle,
  onOpenEvent,
}: {
  role: Role;
  open: boolean;
  onToggle: () => void;
  onOpenEvent: (e: Achievement, trigger: HTMLElement) => void;
}) {
  const uid = useId();
  const buttonId = `${uid}-header`;
  const panelId = `${uid}-panel`;

  return (
    <div
      data-exp-reveal
      className={`exp-reveal overflow-hidden rounded-card border transition-[background-color,border-color] duration-[400ms] ease-brand ${
        open
          ? "border-border bg-[color-mix(in_srgb,var(--text)_5%,transparent)]"
          : "border-transparent border-b-border"
      }`}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center gap-10 px-8 py-7 text-left"
        >
          <span className="w-[190px] shrink-0 font-display text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-muted">
            {role.period}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <span className="block font-display text-[32px] font-medium leading-[1.2] tracking-[0.03em] text-text">
              {role.title}
            </span>
            <span className="block whitespace-pre text-[15px] italic leading-[1.5] text-text-muted">
              {`${role.company}  ·  ${role.location}`}
            </span>
          </span>
          <span
            aria-hidden
            className={`flex size-11 shrink-0 items-center justify-center rounded-full border border-border-strong transition-colors duration-[400ms] ${
              open ? "bg-text text-text-inverse" : "text-text"
            }`}
          >
            <MaskIcon name={open ? "chevron-up" : "chevron-down"} />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-[400ms] ease-brand motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex gap-16 px-8 pb-10 pt-2">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <p className="font-display text-[11px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
                What I did
              </p>
              <ul className="flex flex-col gap-4">
                {role.bullets.map((b) => (
                  <li key={b} className="flex gap-[0.7em] text-[17px] leading-[1.7] text-text-2">
                    <span aria-hidden>—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            {role.related.length > 0 && (
              <div className="flex w-[480px] shrink-0 flex-col gap-[14px]">
                <p className="font-display text-[11px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
                  Projects & events in this role
                </p>
                {role.related.map((item) => (
                  <RelatedCard key={item.title} item={item} onOpenEvent={onOpenEvent} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExperienceList({ roles }: { roles: Role[] }) {
  const [openId, setOpenId] = useState<string | null>(roles[0]?.id ?? null);
  const [event, setEvent] = useState<Achievement | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const openEvent = (e: Achievement, el: HTMLElement) => {
    trigger.current = el;
    setEvent(e);
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {roles.map((role) => (
          <RoleItem
            key={role.id}
            role={role}
            open={openId === role.id}
            onToggle={() => setOpenId(openId === role.id ? null : role.id)}
            onOpenEvent={openEvent}
          />
        ))}
      </div>
      <AchievementModal achievement={event} triggerRef={trigger} onClose={() => setEvent(null)} />
    </>
  );
}
