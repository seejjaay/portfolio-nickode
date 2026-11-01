/* About section copy (DESIGN.md 7.2). Placeholders until real content is
   supplied. `info` is listed row by row: the two columns read
   Name/Phone/Experience/Freelance and Age/Address/Email/Socials. */
export const about = {
  eyebrow: "DISCOVER",
  title: "ABOUT ME",
  intro:
    "I'm a Computer Science undergraduate and developer who enjoys turning ideas into practical digital solutions. I build websites, applications, and software, with experience in data handling, automation, and AI-assisted development. I'm passionate about problem-solving, exploring new technologies, and continuously growing as a developer.",
  info: [
    { key: "Name", value: "CJ Nicko Rosales" },
    { key: "Age", value: "20" },
    { key: "Phone", value: "+63 992 882 0559" },
    { key: "Address", value: "Rosario, Batangas" },
    { key: "Experience", value: "2 years" },
    { key: "Email", value: "cjnickorosales@gmail.com" },
    { key: "Freelance", value: "Available" },
  ],
  socials: [
    {
      label: "Facebook",
      icon: "facebook",
      href: "https://www.facebook.com/nicko.rosales.39/",
    },
    {
      label: "Instagram",
      icon: "instagram",
      href: "https://www.instagram.com/sj.neeko/",
    },
    {
      label: "LinkedIn",
      icon: "linkedin",
      href: "https://www.linkedin.com/in/cj-nicko-rosales-a29527353/",
    },
  ],
  cv: { label: "DOWNLOAD CV", href: "#" },
} as const;
