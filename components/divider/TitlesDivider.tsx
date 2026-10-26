import { titles } from "@/content/site";
import { Marquee } from "./Marquee";

/* Titles divider (DESIGN.md 7.3, Figma node 20:59): a full-bleed band under
   About with two marquees. The top row scrolls left in solid type, the bottom
   row scrolls right in outlined type; they start at different points so items
   never line up. Edges fade into the page background. */
export function TitlesDivider() {
  return (
    <section
      id="divider"
      aria-label="Titles and achievements"
      className="titles-divider relative h-[222px] overflow-hidden border-y border-border"
    >
      {/* Row offsets are measured from the padding box (inside the 1px border). */}
      <div className="marquee-slot absolute inset-x-0 top-[44px]">
        <Marquee items={titles.solid} speed={64} phase={0.02} />
      </div>
      <div className="marquee-slot absolute inset-x-0 top-[125px]">
        <Marquee items={titles.outline} speed={50} phase={0.58} reverse outlined />
      </div>
      <div
        aria-hidden
        className="marquee-fade pointer-events-none absolute -top-px left-0 h-[222px] w-[200px] bg-linear-to-r from-bg to-transparent"
      />
      <div
        aria-hidden
        className="marquee-fade pointer-events-none absolute -top-px right-0 h-[222px] w-[200px] bg-linear-to-r from-transparent to-bg"
      />
    </section>
  );
}
