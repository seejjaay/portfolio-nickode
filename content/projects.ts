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
  repo: { url: string; description: string; license?: string; stars?: number; forks?: number; language?: string };
  liveUrl?: string;
};

const features = [
  { title: "Real-time updates", text: "Changes sync instantly across every connected device, so users always see the latest data." },
  { title: "Secure login", text: "Email and social sign-in with encrypted sessions and role-based access." },
  { title: "Responsive design", text: "A layout that adapts cleanly from phones to wide desktop monitors." },
  { title: "Admin dashboard", text: "A clear control panel for managing content, users and activity at a glance." },
  { title: "Search & filters", text: "Fast, forgiving search with filters that narrow results in a single click." },
  { title: "Fast performance", text: "Optimized loading and caching keep every page responsive under load." },
];

const make = (index: number, title: string, category: string, featured = false): Project => ({
  slug: title.toLowerCase().replace(/\s+/g, "-"),
  index,
  title,
  category,
  featured,
  summary: "A one-line summary of what this project does, who it is for, and why it matters. Keep it short and specific.",
  meta: { role: "Full-stack developer", year: "2026", timeline: "3 months", team: "Solo project", client: "Client or personal", status: "Live" },
  video: { src: "", poster: "", duration: "1:24" },
  overview: [
    "Describe the problem this project set out to solve and who it was built for. Explain the context in two or three sentences so a visitor understands why it exists.",
    "Then describe your approach: the decisions you made, the challenges you ran into, and what the finished result does. Mention the outcome or impact if you have numbers to share.",
  ],
  features,
  screenshots: ["Home", "Mobile", "Dashboard", "Detail", "Settings"].map((name, i) => ({
    src: "",
    caption: `SCREENSHOT 0${i + 1} · ${name.toUpperCase()}`,
  })),
  tech: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS", "Figma", "AWS", "Docker"],
  repo: { url: `github.com/username/${title.toLowerCase().replace(/\s+/g, "-")}`, description: "Short description of the repository: what it contains, how to run it locally, and where to find the documentation.", license: "MIT", stars: 128, forks: 24, language: "TypeScript" },
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
