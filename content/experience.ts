import type { Achievement } from "./achievements";

/* Experience (DESIGN.md 7.7, 11). Roles, bullets and related items are Figma's
   placeholder structure. A "project" links to its detail page (built in step
   10, so those links 404 until then); an "event" opens the event modal and
   carries the same shape as an achievement. */
export type RelatedItem =
  | { type: "project"; slug: string; date: string; title: string; text: string }
  | { type: "event"; date: string; title: string; text: string; event: Achievement };

export type Role = {
  id: string;
  period: string;
  title: string;
  company: string;
  location: string;
  bullets: string[];
  related: RelatedItem[];
};

const annualTechSummit: Achievement = {
  id: "annual-tech-summit",
  kind: "event",
  title: "Annual Tech Summit",
  issuer: "Summit",
  year: "2025",
  tags: ["EVENT", "ORGANIZER", "TECH SUMMIT", "2025"],
  description:
    "Short description of the event and your part in it. Mention what you organized, the size of the audience, and one takeaway people left with. Swipe through the photos to see the day.",
  posts: { linkedin: "#", facebook: "#", instagram: "#" },
  event: {
    name: "Annual Tech Summit",
    date: "March 2025",
    location: "City, Country",
    role: "Organizer",
  },
};

export const roles: Role[] = [
  {
    id: "iteqs-manager",
    period: "2025 — PRESENT",
    title: "ITEQs Manager",
    company: "Company Name",
    location: "City, Country",
    bullets: [
      "Led the ITEQs team and set the roadmap for the year.",
      "Coordinated members, schedules and partner organizations.",
      "Introduced a mentoring program that grew participation.",
    ],
    related: [
      {
        type: "project",
        slug: "iteqs-website-redesign",
        date: "2025",
        title: "ITEQs Website Redesign",
        text: "Rebuilt the organization site with a clearer structure and faster pages.",
      },
      {
        type: "event",
        date: "MARCH 2025",
        title: "Annual Tech Summit",
        text: "Organized a full-day event with speakers, workshops and 300 attendees.",
        event: annualTechSummit,
      },
    ],
  },
  {
    id: "previous-role",
    period: "2021 — 2024",
    title: "Previous Role",
    company: "Company Name",
    location: "City, Country",
    bullets: [
      "Describe what you owned and the outcome it had.",
      "Describe a second responsibility or a result you can measure.",
      "Describe how you worked with the team around you.",
    ],
    related: [],
  },
  {
    id: "earlier-role",
    period: "2019 — 2021",
    title: "Earlier Role",
    company: "Company Name",
    location: "City, Country",
    bullets: [
      "Describe what you owned and the outcome it had.",
      "Describe a second responsibility or a result you can measure.",
      "Describe how you worked with the team around you.",
    ],
    related: [],
  },
];
