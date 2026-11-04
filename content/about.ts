import { socials } from "./socials";
/* About section copy (DESIGN.md 7.2). Placeholders until real content is
   supplied. `info` is listed row by row: the two columns read
   Name/Address/Experience and Age/Email/Freelance, then Socials on its own row. */
export const about = {
  eyebrow: "DISCOVER",
  title: "ABOUT ME",
  intro:
    "I'm a Computer Science undergraduate and developer who enjoys turning ideas into practical digital solutions. I build websites, applications, and software, with experience in data handling, automation, and AI-assisted development. I'm passionate about problem-solving, exploring new technologies, and continuously growing as a developer.",
  info: [
    { key: "Name", value: "CJ Nicko Rosales" },
    { key: "Age", value: "20" },
    { key: "Address", value: "Rosario, Batangas" },
    { key: "Email", value: "cjnickorosales@gmail.com" },
    { key: "Experience", value: "2 years" },
    { key: "Freelance", value: "Available" },
  ],

  socials,
  cv: { label: "DOWNLOAD CV", href: "/cv/CJ-Nicko-Rosales-CV.pdf", file: "CJ-Nicko-Rosales-CV.pdf" },
} as const;
