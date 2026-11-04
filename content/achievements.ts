/* Achievements (DESIGN.md 7.6, 11). Certificates and awards are real, taken from
   the PDFs in public/certificates (a full image and a 240px thumb per item).
   There are no events yet; add them with the event() helper once photos and details exist.
   Social post links are left empty on purpose; the share row hides when there are none. Every item opens the certificate modal
   (certificate, award) or the event modal (event).

   Related items (Batang Techno, IQnnect, Code Smarter) share a tag and are
   listed next to each other, newest first. */
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

const eventText =
  "Short description of the event and your part in it. Mention the topic you presented, the size of the audience, and one takeaway people left with. Swipe through the photos to see the day.";

/* Full image for the modal sheet, small square for the card. */
const imgs = (id: string) => ({
  image: `/certificates/${id}.webp`,
  thumb: `/certificates/${id}-thumb.webp`,
});

type CertExtra = Pick<Achievement, "description"> & Partial<Achievement>;

const cert = (
  id: string,
  title: string,
  issuer: string,
  year: string,
  tags: string[],
  extra: CertExtra,
): Achievement => ({
  id,
  kind: "certificate",
  title,
  issuer,
  year,
  tags: ["CERTIFICATE", ...tags, year],
  posts: {},
  credentialId: undefined,
  expires: "No expiration",
  verifyUrl: undefined,
  ...imgs(id),
  ...extra,
});

const award = (
  id: string,
  title: string,
  issuer: string,
  year: string,
  tags: string[],
  extra: CertExtra,
): Achievement => ({
  id,
  kind: "award",
  title,
  issuer,
  year,
  tags: ["AWARD", ...tags, year],
  posts: {},
  ...imgs(id),
  ...extra,
});

export const event = (
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
  posts: {},
  event: details,
});

/* Newest first. The row dealer below spreads neighbours across the three rows. */
export const achievements: Achievement[] = [
  cert("pandesal-wackathon", "Pandesal.DEV Wackathon", "Pandesal.DEV", "2026", ["HACKATHON", "VIRTUAL"], {
    issued: "October 26, 2026",
    credentialId: "PDEV-WCKTHN-2026-025",
    description:
      "A virtual hackathon with the motto Useless Problems. Serious Engineering. I submitted a project proposal, Keyboard Warrior: a 2D browser fighting game with no gamepad, WASD or mouse, where every move is typed as plain text, like \"walk forward, jab, jab, sweep\". Both fighters queue their typed commands each tick and play them out together, an AI opponent types back with typos and attitude, and you can define your own macros mid-match. It takes on a problem nobody needed solved: keyboard warriors have never had a fighting game made for them. The Pandesal.DEV admins issued this certificate of participation for the submission.",
  }),
  cert("appbuilders-hackathon", "AppBuildersPH Hackathon 2026", "App Builders PH", "2026", ["HACKATHON", "ON-SITE"], {
    issued: "October 2026",
    description:
      "Two days of building at the AppBuildersPH Hackathon, held October 9 to 10, 2026 at Cyberzone, SM Makati. I joined as a member of a team of three (the team name really was PLACEHOLDER) and we built Lokal.MD, an offline clinical documentation and medication-safety workstation for rural health units. Taglish speech is transcribed locally, a local model drafts the SOAP note, and a rules engine checks medication safety, all with no internet. It is one of my featured projects.",
  }),
  cert("codesmarter-attendee", "Code Smarter, Attendee and Volunteer", "DEVCON Manila", "2026", ["AI-ASSISTED DEV", "VOLUNTEER"], {
    issued: "September 6, 2026",
    description:
      "DEVCON Manila recognised me twice for the online webinar Code Smarter: Modern Software Development with AI, as an attendee and as an event volunteer. Four expert-led sessions covered writing better prompts, building apps faster from frontend to APIs, an AI-powered workflow for testing, debugging, code review and documentation, and what it takes to be an AI-ready developer. The volunteer certificate credits my service behind the scenes in making the event run.",
  }),
  cert("datacamp-sql", "Associate Data Engineer in SQL", "DataCamp", "2026", ["SQL", "DATA ENGINEERING"], {
    issued: "June 28, 2026",
    credentialId: "#882,854",
    verifyUrl: "https://www.datacamp.com/completed/statement-of-accomplishment/track/cb4d73ad29b196180a0653bb31708b43a1de39e3",
    description:
      "DataCamp's 28-hour Associate Data Engineer in SQL career track, completed June 28, 2026 (a statement of accomplishment for the track, not the separate exam). It covers the SQL side of data engineering: querying and shaping data in relational databases and designing how it is stored.",
  }),
  award("batangtechno-finalist", "Batang Techno Hackathon, 3rd Runner Up", "Batang Techno", "2026", ["BATANG TECHNO", "FINALIST", "3RD RUNNER UP"], {
    issued: "April 10, 2026",
    description:
      "My team, Null Set (Mark Jester Guce, Josiah Rosell, Lance Derick De Villa and me), finished 3rd Runner Up and was recognised as a finalist in the Hackathon Challenge of Batang Techno: Building the Minds of Tomorrow's Innovators, representing De La Salle Lipa. We built VeriFund PH, a social aid distribution platform that gets ayuda to verified people. I was a developer and handled logistics. The College of Informatics and Computing Sciences at Batangas State University hosted it, and the dean signed the certificate.",
  }),
  cert("batangtechno-hackathon", "Batang Techno Hackathon, Participant", "Batang Techno", "2026", ["BATANG TECHNO", "HACKATHON"], {
    issued: "April 10, 2026",
    description:
      "Participation in the Hackathon Challenge of Batang Techno, run online over Zoom and Facebook Live by the College of Informatics and Computing Sciences at Batangas State University. I entered for De La Salle Lipa with team Null Set and our project VeriFund PH, which ended the day as 3rd Runner Up.",
  }),
  cert("batangtechno-seminar", "Batang Techno, Hackathon Orientation", "Batang Techno", "2026", ["BATANG TECHNO", "SEMINAR"], {
    issued: "March 16, 2026",
    description:
      "The kickoff for Batang Techno: the Hackathon Seminar and Orientation, held online on March 16, 2026 by the College of Informatics and Computing Sciences at Batangas State University. It came first, about a month before the hackathon itself on April 10, where we finished 3rd Runner Up.",
  }),
  cert("ibm-backend", "IBM Back-End Development", "IBM", "2026", ["BACK-END", "PYTHON", "DOCKER"], {
    issued: "February 17, 2026",
    credentialId: "RPM80634SMWR",
    verifyUrl: "https://coursera.org/share/f0c244a12377f9e1818a361c8d55c590",
    description:
      "IBM's Back-End Development Professional Certificate on Coursera: 11 courses, each with its own certificate, ending in a capstone project. They run from Introduction to Software Engineering, Git and GitHub, and Linux commands and shell scripting, through Python for data science and AI, building and deploying AI applications with Flask, and Django with SQL and databases, to containers with Docker, Kubernetes and OpenShift, microservices and serverless, application security, and monitoring and observability.",
  }),
  cert("zuitt-web", "Basic Web Development Workshop", "Zuitt", "2026", ["WEB DEV", "WORKSHOP"], {
    issued: "February 7, 2026",
    credentialId: "06303",
    description:
      "Zuitt's free Coding Bootcamp: an online Basic Web Development Workshop held on February 7, 2026 with Google Developer Groups on Campus at Pamantasan ng Lungsod ng Maynila.",
  }),
  cert("ethical-hacking", "Bridging Ethical Hacking and Data Analytics", "DLSL", "2026", ["ETHICAL HACKING", "DATA ANALYTICS"], {
    issued: "January 13, 2026",
    description:
      "A seminar at the De La Salle Lipa Amphitheater on building smarter and safer systems by combining ethical hacking with data analytics. The certificate is signed by the dean of the College of Information Technology and Engineering and by the department chair of Swinburne University of Technology, Australia.",
  }),
  cert("masterclass-101", "Masterclass 101", "JPCS DLSL", "2025", ["CLOUD", "EMERGING TECH"], {
    issued: "May 15, 2025",
    description:
      "Masterclass 101, a session on cloud and emerging technologies held by the Junior Philippine Computer Society, De La Salle Lipa chapter, at the Nexus Co-Working Space on campus. I attended, and the certificate recognises my active participation.",
  }),
  award("iqnnect-winner", "IQnnect 2025, 1st Place", "JPCS DLSL", "2025", ["IQNNECT", "QUIZ BEE", "1ST PLACE"], {
    issued: "May 8, 2025",
    description:
      "My team won 1st place at IQnnect 2025, the quiz bee of the Junior Philippine Computer Society, held at De La Salle Lipa on May 8, 2025 as part of JPCS Month. I competed with Divine Garduque and CJ Fabello, and the award recognises outstanding performance, teamwork and excellence in IT knowledge. I also hold the event's participation certificate.",
  }),
  cert("uptech", "UpTech 2025", "JPCS DLSL", "2025", ["JPCS", "EMERGING TECH"], {
    issued: "April 24, 2025",
    description:
      "UpTech 2025, a tech talk and seminar on emerging technologies by the Junior Philippine Computer Society, De La Salle Lipa chapter, held April 24, 2025 at the CBEAM Function Hall on campus. I attended, and the certificate recognises my active participation.",
  }),
  cert("sikaptala", "SIKAPTala 2025, Java Skills Competition", "SIKAPTala", "2025", ["JAVA", "COMPETITION"], {
    issued: "March 31, 2025",
    description:
      "I competed solo in the Collegiate Java Skills Competition of SIKAPTala 2025: The National CS & IT Competition, organised by the College of Information and Computer Studies Student Government of De La Salle University - Dasmariñas. My professor at De La Salle Lipa selected me to represent the school. It ran online from March 24 to 29, 2025, and I took part without placing.",
  }),
  cert("dlsl-java", "Java Programming 1", "CodeChum", "2025", ["JAVA", "95% SCORE"], {
    issued: "March 7, 2025",
    credentialId: "7843",
    description:
      "The Java Programming 1 course at De La Salle Lipa, taken on CodeChum as a class requirement and finished with a 95% score in 1 hour 49 minutes. I competed in the SIKAPTala Java skills competition a couple of weeks later.",
  }),
];

/* The three marquee rows, dealt round-robin so neighbours in time (and related
   items) land in different rows. Row 3 is the faint depth row, so it is decorative. */
const rows: Achievement[][] = [[], [], []];
achievements.forEach((a, i) => rows[i % 3].push(a));
export const achievementRows = rows as unknown as readonly [
  Achievement[],
  Achievement[],
  Achievement[],
];

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
