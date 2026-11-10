import { FeatureGrid } from "@/components/project/FeatureGrid";
import { VideoPlayer } from "@/components/project/VideoPlayer";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mileplan } from "@/content/process";

/* MilePlan block (DESIGN.md 8.1.3): intro, the walkthrough clip in the project
   video player, then what a client can do in the portal. */
export function MileplanSection() {
  return (
    <section className="flex flex-col gap-12">
      <div>
        <SectionHeader reveal eyebrow={mileplan.eyebrow} title={mileplan.title} />
        <div className="mt-12 flex max-w-[760px] flex-col gap-5 px-[var(--gutter)]">
          {mileplan.intro.map((p, i) => (
            <p key={p} data-reveal="" style={{ "--i": i } as React.CSSProperties} className="font-body text-[18px] leading-[1.7] text-text-2">
              {p}
            </p>
          ))}
        </div>
      </div>
      <div data-reveal="zoom" className="px-[var(--gutter)]">
        <VideoPlayer video={mileplan.video} title="MilePlan walkthrough" label="MILEPLAN WALKTHROUGH" />
        <p className="mt-4 font-body text-[14px] italic leading-[1.6] text-text-muted">{mileplan.caption}</p>
      </div>
      <FeatureGrid features={mileplan.features} eyebrow="WHAT YOU CAN DO" title="IN YOUR PORTAL" />
    </section>
  );
}
