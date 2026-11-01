/* What I offer (DESIGN.md 7.3.1). Placeholder services until real copy is
   supplied; each has a two-line summary and 2 to 4 tags. Order is the order the
   cards come out of the folder, so the last one ends up on top of the deck. */
export type Service = {
  id: string;
  index: number;
  title: string;
  summary: string;
  tags: string[];
};

export const services: Service[] = [
  {
    id: "web-development",
    index: 1,
    title: "Web Development",
    summary:
      "Modern, responsive websites built to fit your needs, from landing pages and portfolios to full-stack web applications and business platforms.",
    tags: ["Frontend", "Backend", "Full-Stack", "Responsive Design"],
  },
  {
    id: "software-development",
    index: 2,
    title: "Software & Application Development",
    summary:
      "Functional software and applications designed to solve real-world problems, streamline processes, and turn ideas into working solutions.",
    tags: ["Software", "Applications", "Problem Solving"],
  },
  {
    id: "saas-development",
    index: 3,
    title: "SaaS & System Development",
    summary:
      "Web-based systems and platforms tailored to specific needs, from event management systems to custom business solutions.",
    tags: ["SaaS", "System Development", "Full-Stack"],
  },
  {
    id: "ui-ux-design",
    index: 4,
    title: "Web Design & UI/UX",
    summary:
      "Clean, intuitive, and user-friendly interfaces that balance visual appeal with functionality, creating better digital experiences.",
    tags: ["UI/UX", "Web Design", "Prototyping"],
  },
  {
    id: "automation",
    index: 5,
    title: "Workflow Automation",
    summary:
      "Automating repetitive tasks and everyday workflows to save time, reduce manual work, and improve efficiency using tools like UiPath.",
    tags: ["UiPath", "RPA", "Workflow Automation"],
  },
  {
    id: "data-modeling",
    index: 6,
    title: "Database Design & Data Modeling",
    summary:
      "Structuring and organizing data through database schemas, entity relationships, and logical models to support reliable and scalable applications.",
    tags: ["Data Modeling", "SQL", "Database Design"],
  },
  {
    id: "game-development",
    index: 7,
    title: "Game Development",
    summary:
      "Developing interactive games and digital experiences, combining programming, mechanics, and creativity to bring ideas to life.",
    tags: ["Game Development", "Programming", "Interactive Design"],
  },
];
