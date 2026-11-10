import Link from "next/link";
import { btnPrimary } from "./styles";

/* Closing call (DESIGN.md 8.1.5). */
export function ClosingCall() {
  return (
    <section className="flex flex-col items-start gap-8 border-t border-border px-[var(--gutter)] pt-16">
      <h2 data-reveal="" className="font-display text-[clamp(36px,5vw,64px)] font-medium uppercase leading-[1.1] tracking-[0.04em] text-text">
        HAVE A PROJECT IN MIND?
      </h2>
      <div data-reveal="" style={{ "--i": 1 } as React.CSSProperties}>
        <Link href="/#contact" className={btnPrimary}>
        LET&apos;S TALK →
        </Link>
      </div>
    </section>
  );
}
