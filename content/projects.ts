/* Projects (DESIGN.md 7.4, 8, 11). Titles and categories follow Figma's
   placeholders (PROJECT FOUR is the featured one); everything else is
   placeholder copy, shaped for the Project Detail page built in step 10. */
export type Project = {
  slug: string;
  index: number; // 1-based, shown as 04 on the card
  title: string;
  category: string;
  featured?: boolean;
  summary: string;
  meta: { role: string; year: string; timeline: string; team: string; client?: string; status: string };
  video: { src: string; poster: string; duration: string };
  overview: string[];
  features: { title: string; text: string }[];
  screenshots: { src: string; caption: string }[];
  tech: string[];
  repo: { url: string; description: string; license?: string };
  liveUrl?: string;
};

const features = [
  { title: "Real-time updates", text: "Changes show up instantly across every open session." },
  { title: "Secure login", text: "Sign-in with sessions, roles and sensible defaults." },
  { title: "Responsive design", text: "Comfortable on a phone, a laptop and a wide monitor." },
  { title: "Admin dashboard", text: "One place to manage content, users and settings." },
  { title: "Search & filters", text: "Find anything quickly and narrow it down as you go." },
  { title: "Fast performance", text: "Small bundles, cached data and lazy-loaded media." },
];

const make = (index: number, title: string, category: string, featured = false): Project => ({
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  index,
  title,
  category,
  featured,
  summary: "One line on what this project is and who it is for.",
  meta: { role: "Full-stack developer", year: "2025", timeline: "3 months", team: "Solo", client: "Client name", status: "Live" },
  video: { src: "", poster: "", duration: "1:24" },
  overview: [
    "The problem: describe what was broken or missing, and for whom.",
    "The approach and result: describe what you built and what changed because of it.",
  ],
  features,
  screenshots: ["Home", "Dashboard", "Detail", "Settings", "Mobile", "Reports"].map((name, i) => ({
    src: "",
    caption: `SCREENSHOT 0${i + 1} · ${name.toUpperCase()}`,
  })),
  tech: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind"],
  repo: { url: `github.com/username/${title.toLowerCase().replace(/\s+/g, "-")}`, description: "Short description of the repository.", license: "MIT" },
  liveUrl: "#",
});

export const projects: Project[] = [
  make(1, "Project One", "WEB APP"),
  make(2, "Project Two", "API"),
  make(3, "Project Three", "DASHBOARD"),
  make(4, "Project Four", "WEB APP", true),
  make(5, "Project Five", "MOBILE"),
  make(6, "Project Six", "DATA"),
  make(7, "Project Seven", "DESIGN"),
];
