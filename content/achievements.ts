/* Achievements (DESIGN.md 7.6, 11). Titles, issuers and years are Figma's
   placeholder structure; ids, tags, descriptions, links and event details are
   placeholders until real content is supplied. Every item opens the
   certificate modal (certificate, award) or the event modal (event). */
export type Achievement = {
  id: string;
  kind: "certificate" | "event" | "award";
  title: string;
  issuer: string; // the middle word of the card's meta line
  year: string;
  tags: string[];
  thumb?: string;
  description: string;
  posts: { linkedin?: string; facebook?: string; instagram?: string };
  // certificate / award
  issued?: string;
  credentialId?: string;
  expires?: string;
  verifyUrl?: string;
  image?: string;
  // event
  event?: { name: string; date: string; location: string; role: string };
  photos?: string[];
};

const certificateText =
  "Short description of what this certification covers and what you had to demonstrate to earn it. Mention the skills it validates, such as writing queries, designing schemas and building reliable data pipelines.";
const eventText =
  "Short description of the event and your part in it. Mention the topic you presented, the size of the audience, and one takeaway people left with. Swipe through the photos to see the day.";
const awardText =
  "Short description of the award: what it recognises, who gave it, and what you did to earn it.";

const cert = (
  id: string,
  title: string,
  issuer: string,
  year: string,
  tags: string[],
  extra: Partial<Achievement> = {},
): Achievement => ({
  id,
  kind: "certificate",
  title,
  issuer,
  year,
  tags: ["CERTIFICATE", ...tags, year],
  description: certificateText,
  posts: { linkedin: "#", facebook: "#", instagram: "#" },
  credentialId: "ID-0000000",
  expires: "No expiration",
  verifyUrl: "#",
  ...extra,
});

const award = (id: string, title: string, issuer: string, year: string, tags: string[]): Achievement => ({
  id,
  kind: "award",
  title,
  issuer,
  year,
  tags: ["AWARD", ...tags, year],
  description: awardText,
  posts: { linkedin: "#", facebook: "#", instagram: "#" },
});

const event = (
  id: string,
  title: string,
  issuer: string,
  year: string,
  tags: string[],
  details: NonNullable<Achievement["event"]>,
): Achievement => ({
  id,
  kind: "event",
  title,
  issuer,
  year,
  tags: ["EVENT", ...tags, year],
  description: eventText,
  posts: { linkedin: "#", facebook: "#", instagram: "#" },
  event: details,
});

export const achievements: Achievement[] = [
  cert("sql-developer", "Associate SQL Developer for Data Engineer", "DataCamp", "2026", ["DATA ENGINEERING", "SQL"], {
    issued: "March 2026",
    credentialId: "DC-0000000",
  }),
  cert("aws-ccp", "AWS Certified Cloud Practitioner", "AWS", "2025", ["CLOUD", "AWS"]),
  event("hackathon-first", "First Place, National Hackathon", "Hackathon", "2025", ["HACKATHON", "FIRST PLACE"], {
    name: "National Hackathon",
    date: "Month 00, 2025",
    location: "City, Country",
    role: "Team lead",
  }),
  cert("google-data-analytics", "Google Data Analytics Professional Certificate", "Coursera", "2025", ["ANALYTICS"]),
  award("deans-lister", "Dean's Lister, College of Engineering", "University", "2024", ["ACADEMIC"]),

  cert("meta-frontend", "Meta Front-End Developer Professional Certificate", "Meta", "2025", ["FRONT-END"]),
  event("speaker-conference", "Speaker, Regional Tech Conference", "Conference", "2025", ["SPEAKER", "TECH CONFERENCE"], {
    name: "Regional Tech Conference",
    date: "August 14, 2025",
    location: "Manila, Philippines",
    role: "Speaker",
  }),
  cert("data-engineer-associate", "Data Engineer Associate Certification", "DataCamp", "2025", ["DATA ENGINEERING"]),
  award("best-capstone", "Best Capstone Project", "Capstone", "2024", ["CAPSTONE"]),
  cert("responsive-web-design", "Responsive Web Design Certification", "freeCodeCamp", "2023", ["WEB"]),

  cert("google-it-support", "Google IT Support Professional Certificate", "Google", "2024", ["IT SUPPORT"]),
  event("data-literacy-workshop", "Facilitator, Data Literacy Workshop", "Workshop", "2024", ["WORKSHOP", "FACILITATOR"], {
    name: "Data Literacy Workshop",
    date: "Month 00, 2024",
    location: "City, Country",
    role: "Facilitator",
  }),
  cert("ibm-data-science", "IBM Data Science Foundations", "IBM", "2023", ["DATA SCIENCE"]),
  award("coding-competition", "Finalist, Collegiate Coding Competition", "Competition", "2023", ["COMPETITION"]),
  cert("azure-fundamentals", "Azure Fundamentals", "Microsoft", "2023", ["CLOUD", "AZURE"]),
];

const byId = new Map(achievements.map((a) => [a.id, a]));
const pick = (ids: string[]) => ids.map((id) => byId.get(id)!);

/* The three marquee rows. Row 3 is the faint depth row, so it is decorative. */
export const achievementRows = [
  pick(["sql-developer", "aws-ccp", "hackathon-first", "google-data-analytics", "deans-lister"]),
  pick(["meta-frontend", "speaker-conference", "data-engineer-associate", "best-capstone", "responsive-web-design"]),
  pick(["google-it-support", "data-literacy-workshop", "ibm-data-science", "coding-competition", "azure-fundamentals"]),
] as const;

/* The four detail cells in the modal, by kind. */
export function detailsFor(a: Achievement): { label: string; value: string }[] {
  if (a.kind === "event" && a.event) {
    return [
      { label: "Event", value: a.event.name },
      { label: "Date", value: a.event.date },
      { label: "Location", value: a.event.location },
      { label: "Role", value: a.event.role },
    ];
  }
  if (a.kind === "award") {
    return [
      { label: "Awarded by", value: a.issuer },
      { label: "Year", value: a.year },
    ];
  }
  return [
    { label: "Issuer", value: a.issuer },
    { label: "Issued", value: a.issued ?? a.year },
    { label: "Credential ID", value: a.credentialId ?? "—" },
    { label: "Expires", value: a.expires ?? "—" },
  ];
}
