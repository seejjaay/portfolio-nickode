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
    id: "data-engineering",
    index: 1,
    title: "Data Engineering & Pipelines",
    summary:
      "Reliable pipelines that move messy data from many sources into clean, queryable tables. Built to be monitored, documented and easy to hand over.",
    tags: ["ETL", "Python", "Airflow", "AWS"],
  },
  {
    id: "sql-databases",
    index: 2,
    title: "SQL & Database Development",
    summary:
      "Schema design, tuned queries and stored procedures that stay fast as the data grows. Reports and views your team can trust and reuse.",
    tags: ["SQL", "Postgres", "T-SQL"],
  },
  {
    id: "cloud-setup",
    index: 3,
    title: "Cloud Setup (AWS / Azure)",
    summary:
      "Practical cloud foundations: storage, compute, access and cost controls set up once and set up properly. Clear notes so nobody is guessing later.",
    tags: ["AWS", "Azure", "IAM", "Cost"],
  },
  {
    id: "web-development",
    index: 4,
    title: "Web Development",
    summary:
      "Fast, accessible sites and web apps built from design to deploy. Clean code, sensible structure and pages that load quickly on any device.",
    tags: ["Next.js", "React", "TypeScript"],
  },
  {
    id: "ui-ux",
    index: 5,
    title: "UI/UX & Prototyping",
    summary:
      "From rough idea to clickable prototype: flows, wireframes and polished screens. Tested with real people before a line of production code is written.",
    tags: ["Figma", "Prototyping", "Research"],
  },
];
