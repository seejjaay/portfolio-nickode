/* How a freelance project runs (DESIGN.md 7.3.2 and 8.1). The steps follow the
   engagement flow in mileplan's spec and the "How it works" terms on the price
   list (content/pricing.ts). */

export type ProcessStep = {
  id: string;
  index: number;
  title: string;
  /** One or two lines for the home rail. */
  gist: string;
  /** The longer version on /process. */
  detail: string;
  youDo: string[];
  youGet: string[];
};

export const steps: ProcessStep[] = [
  {
    id: "discuss",
    index: 1,
    title: "Discuss",
    gist: "We talk through your goals, who it is for and what it needs to do.",
    detail:
      "A call or chat about what you want built, who will use it, what has to be in the first version and what can wait. No commitment, and no prices yet beyond a rough range.",
    youDo: ["Tell me the goal and the deadline", "Share any examples, files or branding you already have"],
    youGet: ["Honest feedback on scope and timeline", "A rough range from the price list"],
  },
  {
    id: "quote",
    index: 2,
    title: "Quote",
    gist: "I send a written quote and timeline, so you know the cost before anything starts.",
    detail:
      "I turn the conversation into a written quote with the scope, the timeline and the price. Final price depends on scope, complexity and timeline, and the price list is where it starts from.",
    youDo: ["Read the quote and ask about anything unclear", "Confirm or adjust the scope"],
    youGet: ["A written quote and timeline", "Add-ons priced separately, if you want them"],
  },
  {
    id: "sign",
    index: 3,
    title: "Sign",
    gist: "You review and sign the paperwork, then pay the 50% deposit to begin.",
    detail:
      "Four documents cover the engagement: a service contract, a project agreement, an SRS (software requirements specification, the written list of what the system must do) and a milestone plan. Once you approve and sign them, the 50% deposit starts the work.",
    youDo: ["Review and sign the four documents", "Pay the 50% deposit"],
    youGet: ["Service contract and project agreement", "SRS and milestone plan, agreed in writing"],
  },
  {
    id: "kickoff",
    index: 4,
    title: "Kick off in MilePlan",
    gist: "Your signed plan becomes a live tracker in MilePlan, my client portal.",
    detail:
      "I load the signed plan into MilePlan and send you a one-time setup link. You set a password, land on your project and see the milestones, the payment schedule and the signed documents. From here on, MilePlan is where we follow the project.",
    youDo: ["Open the setup link and set your password"],
    youGet: ["Your own project page in MilePlan", "The route: every milestone, with a status you can check any time"],
  },
  {
    id: "build",
    index: 5,
    title: "Build & review",
    gist: "I build milestone by milestone; you approve each one, or ask for changes.",
    detail:
      "I post updates and move milestones along. When one is ready, it goes to In review and you approve it or request changes with a comment. You upload proof for each payment, message me in the project and acknowledge any change to the plan. Two revision rounds are included.",
    youDo: ["Approve or request changes on each deliverable", "Upload proof of payment when one is due", "Acknowledge plan changes"],
    youGet: ["Updates without having to ask where things are", "2 revision rounds included"],
  },
  {
    id: "deliver",
    index: 6,
    title: "Deliver",
    gist: "Final payment, then the finished, deployed project is handed over to you.",
    detail:
      "After the final milestone and the remaining 50%, the finished project is deployed and handed over. The tracker becomes a read-only record that stays viewable, and messages stay open for 30 days for wrap-up questions.",
    youDo: ["Pay the remaining 50% on delivery"],
    youGet: ["The deployed project, handed over", "A read-only record of the whole engagement", "30 days of wrap-up messages"],
  },
];

export const mileplan = {
  eyebrow: "02 — MILEPLAN",
  title: "WHERE YOUR PROJECT LIVES",
  intro: [
    "MilePlan is the client portal I built for my own freelance work. Once the paperwork is signed, your project lives there: the milestones, the payment schedule, the signed documents and our messages, all in one place that you and I both see live.",
    "The idea is simple: you should never have to ask where we are. The walkthrough below follows a sample project from the setup link to a finished plan.",
  ],
  video: {
    src: "/process/mileplan.mp4",
    poster: "/process/mileplan-poster.webp",
    duration: "0:37",
  },
  caption: "Sample project. The names and figures in the video are made up.",
  features: [
    { title: "Follow the route", text: "Every milestone on one line with its status, so you can see what is done, what is in review and what is next." },
    { title: "Approve or ask for changes", text: "When a milestone is ready it goes to In review. You approve it, or request changes with a comment." },
    { title: "Payments with proof", text: "See what is paid and what is outstanding, and upload proof of payment against each scheduled amount." },
    { title: "Plan changes, acknowledged", text: "If the plan changes, you see a banner with the reason and acknowledge it, so nothing shifts quietly." },
    { title: "Messages and updates", text: "Message me inside the project, get notified, and see what changed since your last visit." },
    { title: "Documents and a clean close", text: "The signed documents sit with the project. At close-out it turns read-only, and stays viewable." },
  ],
};
