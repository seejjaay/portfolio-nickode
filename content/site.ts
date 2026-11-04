/* Site-level copy (DESIGN.md section 11). Bracketed or ALL-CAPS "YOUR ..."
   values are placeholders until real content is supplied. */
export const site = {
  name: "NICK.ODE",
  role: "Full Stack Developer",
} as const;

/* Titles divider (DESIGN.md 7.3): job titles, certifications and awards.
   `solid` scrolls left, `outline` scrolls right. Placeholder structure from
   the Figma frame. */
export const titles = {
  solid: [
    "ITEQs Manager",
    "Associate Data Engineer in SQL",
    "Full Stack Developer",
    "Software Engineer",
    "Microsoft Student Ambassador",
    "Devcon Volunteer",
    "DysrupIT Mentee",
  ],
  outline: [
    "ITEQs Manager",
    "Associate Data Engineer in SQL",
    "Full Stack Developer",
    "Software Engineer",
    "Microsoft Student Ambassador",
    "Devcon Volunteer",
    "DysrupIT Mentee",
  ],
} as const;
