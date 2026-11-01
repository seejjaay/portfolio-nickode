/* Achievements (DESIGN.md 7.6, 11). Every entry is a placeholder (titles,
   issuers, years, tags, descriptions, links, event details) until real content
   is supplied. Every item opens the
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

const award = (
  id: string,
  title: string,
  issuer: string,
  year: string,
  tags: string[],
): Achievement => ({
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
  cert(
    "cert-01",
    "Certificate Title, Data Track",
    "Issuer",
    "2026",
    ["TOPIC ONE", "TOPIC TWO"],
    {
      issued: "Month 2026",
      credentialId: "ID-0000001",
    },
  ),
  cert("cert-02", "Certificate Title, Cloud Track", "Issuer", "2025", [
    "TOPIC ONE",
    "TOPIC TWO",
  ]),
  event(
    "event-01",
    "Event Title, Competition Result",
    "Event",
    "2025",
    ["TOPIC ONE", "RESULT"],
    {
      name: "Event Name",
      date: "Month 00, 2025",
      location: "City, Country",
      role: "Your role",
    },
  ),
  cert("cert-03", "Professional Certificate Title", "Issuer", "2025", [
    "TOPIC ONE",
  ]),
  award(
    "award-01",
    "Award Title, Department or School",
    "Organization",
    "2024",
    ["TOPIC ONE"],
  ),

  cert("cert-04", "Professional Certificate Title, Web", "Issuer", "2025", [
    "TOPIC ONE",
  ]),
  event(
    "event-02",
    "Event Title, Speaking Role",
    "Event",
    "2025",
    ["SPEAKER", "TOPIC ONE"],
    {
      name: "Event Name",
      date: "Month 00, 2025",
      location: "City, Country",
      role: "Speaker",
    },
  ),
  cert("cert-05", "Associate Certification Title", "Issuer", "2025", [
    "TOPIC ONE",
  ]),
  award("award-02", "Award Title, Project", "Organization", "2024", [
    "TOPIC ONE",
  ]),
  cert("cert-06", "Certification Title, Fundamentals", "Issuer", "2023", [
    "TOPIC ONE",
  ]),

  cert("cert-07", "Professional Certificate Title, Support", "Issuer", "2024", [
    "TOPIC ONE",
  ]),
  event(
    "event-03",
    "Event Title, Workshop Role",
    "Event",
    "2024",
    ["WORKSHOP", "TOPIC ONE"],
    {
      name: "Event Name",
      date: "Month 00, 2024",
      location: "City, Country",
      role: "Facilitator",
    },
  ),
  cert("cert-08", "Certificate Title, Foundations", "Issuer", "2023", [
    "TOPIC ONE",
  ]),
  award(
    "award-03",
    "Award Title, Competition Finalist",
    "Organization",
    "2023",
    ["TOPIC ONE"],
  ),
  cert("cert-09", "Certification Title, Fundamentals", "Issuer", "2023", [
    "TOPIC ONE",
    "TOPIC TWO",
  ]),
];

const byId = new Map(achievements.map((a) => [a.id, a]));
const pick = (ids: string[]) => ids.map((id) => byId.get(id)!);

/* The three marquee rows. Row 3 is the faint depth row, so it is decorative. */
export const achievementRows = [
  pick(["cert-01", "cert-02", "event-01", "cert-03", "award-01"]),
  pick(["cert-04", "event-02", "cert-05", "award-02", "cert-06"]),
  pick(["cert-07", "event-03", "cert-08", "award-03", "cert-09"]),
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
