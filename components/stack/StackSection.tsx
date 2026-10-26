import { SectionHeader } from "@/components/ui/SectionHeader";
import { StackScene } from "./StackScene";

/* What I use (DESIGN.md 7.5, Figma nodes 3:27 and 37:203): the section header,
   then a pinned scene where a network of the tech I use grows from one node. */
export function StackSection() {
  return (
    <section id="stack">
      <div className="pb-14 pt-[120px]">
        <SectionHeader eyebrow="03 — TECH STACK" title="WHAT I USE" />
      </div>
      <StackScene />
    </section>
  );
}
