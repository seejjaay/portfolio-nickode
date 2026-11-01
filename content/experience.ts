import type { Achievement } from "./achievements";

/* Experience (DESIGN.md 7.7, 11). Roles, bullets and related items are Figma's
   placeholder structure. A "project" links to its detail page (built in step
   10, so those links 404 until then); an "event" opens the event modal and
   carries the same shape as an achievement. */
export type RelatedItem =
  | { type: "project"; slug: string; date: string; title: string; text: string }
  | {
      type: "event";
      date: string;
      title: string;
      text: string;
      event: Achievement;
    };

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
    location: "Lipa City, Batangas, Philippines",
    bullets: [
      "Developed software and hardware solutions to support the organization's operations and event requirements.",
      "Streamlined the Creatives Team's workflow by automating task reminders and notifications.",
      "Served as one of the organization's main developers, leading the development of internal systems and digital solutions.",
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
    id: "devcon-volunteer",
    period: "2026 - PRESENT",
    title: "Volunteer / Backend Engineer Volunteer",
    company: "Devcon",
    location: "Manila, Philippines",
    bullets: [
      "Supported event management activities, including the preparation and creation of participant certificates.",
      "Contributed as a volunteer developer, helping build and maintain software solutions for organizational projects.",
      "Collaborated with fellow volunteers and organizers to support event operations and development initiatives.",
    ],
    related: [],
  },
  {
    id: "computer-science-program-coordinator",
    period: "2025 - 2026",
    title: "Computer Science Program Coordinator",
    company: "DLSL Student Government - CITE Council",
    location: "Lipa City, Batangas, Philippines",
    bullets: [
      "Represented the Computer Science program in the De La Salle Lipa Student Government, serving as a liaison between students and the council.",
      "Assisted Computer Science students with academic concerns, inquiries, and program-related matters.",
      "Helped organize and facilitate events, seminars, and activities under the College of Information, Technology, and Engineering (CITE) and De La Salle Lipa.",
    ],
    related: [],
  },
];
