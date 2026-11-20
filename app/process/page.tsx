import type { Metadata } from "next";
import { ClosingCall } from "@/components/process/ClosingCall";
import { MileplanSection } from "@/components/process/MileplanSection";
import { ProcessHeader } from "@/components/process/ProcessHeader";
import { StepList } from "@/components/process/StepList";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

/* Process (DESIGN.md 8.1): one static page. Sections sit 96px apart,
   as on Project Detail. */
export const metadata: Metadata = {
  title: "How we'll work — NICK.ODE",
  description:
    "How a freelance project with NICK.ODE runs, from the first conversation to the handover, and where it is tracked in MilePlan.",
};

export default function ProcessPage() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <ScrollProgress />
      <ProcessHeader />
      <StepList />
      <MileplanSection />
      <ClosingCall />
      <Reveal />
    </div>
  );
}
