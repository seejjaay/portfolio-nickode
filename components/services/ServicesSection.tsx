import { SectionHeader } from "@/components/ui/SectionHeader";
import { services } from "@/content/services";
import { ServicesScene } from "./ServicesScene";

/* What I offer (DESIGN.md 7.3.1): the section header, then a pinned scene where
   a closed folder opens and deals the five services out as a deck of cards. */
export function ServicesSection() {
  return (
    <section id="services" className="-mb-[120px]">
      {/* The negative margins tuck the pinned stage's empty top (above the closed folder)
          under the header and its empty bottom (below the open folder) under the next
          section, so neither shows as a gap. */}
      <div className="-mb-[124px] pb-14 pt-[72px] max-md:-mb-[200px]">
        <SectionHeader eyebrow="02 — WHAT I OFFER" title="WHAT CAN I OFFER" />
      </div>
      <ServicesScene services={services} />
    </section>
  );
}
