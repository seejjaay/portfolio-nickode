import { CountUp } from "@/components/ui/CountUp";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { addOns, priceGroups, priceListPdf, pricingNote, terms, type Package } from "@/content/pricing";
import { btnSecondary, eyebrow } from "./styles";

/* Pricing (DESIGN.md 8.1.4): three groups of package cards, the add-ons and
   the terms, then the PDF. The numbers live in content/pricing.ts. */
export function PricingSection() {
  return (
    <section>
      <SectionHeader reveal eyebrow="03 — PRICING" title="WHAT IT COSTS" />

      <div className="mt-12 flex flex-col gap-16 px-[var(--gutter)]">
        {priceGroups.map((g) => (
          <div key={g.id}>
            <div data-reveal="" className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h3 className="font-display text-[clamp(24px,2.4vw,32px)] font-medium uppercase leading-[1.2] tracking-[0.04em] text-text">
                {g.title}
              </h3>
              <p className={eyebrow}>{g.kicker}</p>
            </div>
            <ul
              className={`mt-6 grid items-stretch gap-6 ${
                g.layout === "full" ? "md:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {g.packages.map((p, i) => (
                <PackageCard key={p.name} pkg={p} compact={g.layout === "compact"} i={i % (g.layout === "full" ? 3 : 4)} />
              ))}
            </ul>
          </div>
        ))}

        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
          <div>
            <h3 data-reveal="" className="font-display text-[clamp(24px,2.4vw,32px)] font-medium uppercase leading-[1.2] tracking-[0.04em] text-text">
              ADD-ONS
            </h3>
            <dl className="mt-6 border-t border-border">
              {addOns.map((a, i) => (
                <div key={a.label} data-reveal="" style={{ "--i": i % 3 } as React.CSSProperties} className="flex items-baseline justify-between gap-6 border-b border-border py-3.5">
                  <dt className="font-body text-[17px] leading-[1.5] text-text-2">{a.label}</dt>
                  <dd className="shrink-0 font-display text-[16px] font-medium tracking-[0.02em] text-text">{a.price}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 data-reveal="" className="font-display text-[clamp(24px,2.4vw,32px)] font-medium uppercase leading-[1.2] tracking-[0.04em] text-text">
              HOW IT WORKS
            </h3>
            <dl className="mt-6 flex flex-col gap-4">
              {terms.map((t, i) => (
                <div key={t.label} data-reveal="" style={{ "--i": i % 3 } as React.CSSProperties}>
                  <dt className={eyebrow}>{t.label}</dt>
                  <dd className="mt-1 font-body text-[17px] leading-[1.6] text-text-2">{t.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div data-reveal="" className="flex flex-col items-start gap-5 border-t border-border pt-8">
          <p className="max-w-[62ch] font-body text-[14px] italic leading-[1.6] text-text-muted">{pricingNote}</p>
          <a href={priceListPdf.href} download={priceListPdf.file} className={btnSecondary}>
            {priceListPdf.label} ↓
          </a>
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, compact, i }: { pkg: Package; compact: boolean; i: number }) {
  return (
    <li data-reveal="" style={{ "--i": i } as React.CSSProperties} className="flex">
      <div className="flex w-full flex-col rounded-card border border-border bg-surface/60 p-8 backdrop-blur-sm transition-[border-color,transform] duration-[400ms] ease-brand hover:-translate-y-1 hover:border-border-strong motion-reduce:transition-none">
      <h4 className="font-display text-[22px] font-medium uppercase leading-[1.2] tracking-[0.03em] text-text">{pkg.name}</h4>
      <p className="mt-4 flex items-baseline gap-2.5">
        <span className={eyebrow}>FROM</span>
        <CountUp to={pkg.from} prefix="₱" className="font-display text-[40px] font-semibold leading-none tracking-[0.01em] text-text" />
      </p>
      <p className="mt-2 font-body text-[14px] italic leading-[1.5] text-text-muted">{pkg.timeline}</p>
      <p className="mt-4 font-body text-[17px] leading-[1.6] text-text-2">{pkg.summary}</p>
      {!compact && pkg.inclusions && (
        <ul className="mt-5 flex flex-col gap-1.5 border-t border-border pt-5">
          {pkg.inclusions.map((t) => (
            <li key={t} className="flex gap-3 font-body text-[16px] leading-[1.55] text-text-2">
              <span aria-hidden className="mt-[0.72em] h-px w-3 shrink-0 bg-text-muted" />
              {t}
            </li>
          ))}
        </ul>
      )}
      </div>
    </li>
  );
}
