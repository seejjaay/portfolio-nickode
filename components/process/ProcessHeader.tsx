import Link from "next/link";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { priceListPdf } from "@/content/pricing";
import { btnPrimary, btnSecondary, eyebrow } from "./styles";

/* Process & pricing page header (DESIGN.md 8.1). Same shape as ProjectHeader. */
export function ProcessHeader() {
  return (
    <header className="px-[var(--gutter)] pt-14">
      <Link
        href="/#process"
        data-enter=""
        className="group flex min-h-[44px] w-fit items-center gap-[10px] font-display text-[13px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text"
      >
        <MaskIcon
          name="arrow-left"
          width={16}
          className="transition-transform duration-300 ease-brand group-hover:-translate-x-1 motion-reduce:transition-none"
        />
        BACK TO HOME
      </Link>

      <p data-enter="" style={{ "--i": 1 } as React.CSSProperties} className={`mt-7 ${eyebrow}`}>
        FREELANCE · 2026
      </p>
      <h1 data-enter="" style={{ "--i": 2 } as React.CSSProperties} className="mt-7 font-display text-[clamp(56px,8.33vw,120px)] font-semibold uppercase leading-[1.1] tracking-[0.01em] text-text">
        HOW WE&apos;LL WORK
      </h1>
      <p data-enter="" style={{ "--i": 3 } as React.CSSProperties} className="mt-7 max-w-[760px] font-body text-[20px] leading-[1.7] text-text-2">
        From the first conversation to the handover: what happens at each step, where your project lives once it starts, and what
        it costs.
      </p>

      <div data-enter="" style={{ "--i": 4 } as React.CSSProperties} className="mt-10 flex flex-wrap items-start gap-4">
        <a href={priceListPdf.href} download={priceListPdf.file} className={btnPrimary}>
          {priceListPdf.label} ↓
        </a>
        <Link href="/#contact" className={btnSecondary}>
          START A PROJECT →
        </Link>
      </div>
    </header>
  );
}
