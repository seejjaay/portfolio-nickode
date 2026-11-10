import { SectionHeader } from "@/components/ui/SectionHeader";
import { steps } from "@/content/process";
import { eyebrow } from "./styles";

/* The six steps in full (DESIGN.md 8.1.2): a numbered vertical list on the same
   rail motif as the home section. */
export function StepList() {
  return (
    <section>
      <SectionHeader reveal eyebrow="01 — THE PROCESS" title="SIX STEPS, START TO FINISH" />
      <ol className="relative mt-12 px-[var(--gutter)]">
        {steps.map((s, i) => (
          <li key={s.id} className="relative grid gap-x-10 gap-y-4 pb-14 last:pb-0 md:grid-cols-[88px_1fr]">
            {/* The rail: a marker per step with a line down to the next one. */}
            <div className="relative flex md:block">
              <span
                aria-hidden
                data-reveal="pop"
                className="relative z-10 mt-1 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-border-strong bg-bg font-display text-[15px] font-medium text-text"
              >
                {String(s.index).padStart(2, "0")}
              </span>
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute left-[22px] top-[52px] hidden h-[calc(100%+12px)] w-px bg-border md:block">
                  <span data-reveal="grow-y" style={{ "--i": 2 } as React.CSSProperties} className="block size-full bg-text" />
                </span>
              )}
            </div>
            <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties} className="grid gap-x-10 gap-y-6 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <h3 className="font-display text-[clamp(28px,3vw,40px)] font-medium uppercase leading-[1.2] tracking-[0.03em] text-text">
                  <span className="sr-only">Step {s.index}: </span>
                  {s.title}
                </h3>
                <p className="mt-3 max-w-[62ch] font-body text-[18px] leading-[1.7] text-text-2">{s.detail}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <Bullets label="YOU DO" items={s.youDo} />
                <Bullets label="YOU GET" items={s.youGet} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Bullets({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className={eyebrow}>{label}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((t) => (
          <li key={t} className="flex gap-3 font-body text-[16px] leading-[1.6] text-text-2">
            <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-text-muted" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
