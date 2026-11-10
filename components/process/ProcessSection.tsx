import { ProcessScene } from "./ProcessScene";

/* How we'll work (DESIGN.md 7.3.2): sits between What I offer and What I've
   done. The section header lives inside the pinned stage so it stays on
   screen while the line is drawn. */
export function ProcessSection() {
  return (
    <section id="process">
      <ProcessScene />
    </section>
  );
}
