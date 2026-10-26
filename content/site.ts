/* Site-level copy (DESIGN.md section 11). Bracketed or ALL-CAPS "YOUR ..."
   values are placeholders until real content is supplied. */
export const site = {
  name: "NICK.ODE",
  role: "[YOUR ROLE]",
  fullName: "YOUR FULL NAME",
  website: "YOURWEBSITE.COM",
} as const;

/* Titles divider (DESIGN.md 7.3): job titles, certifications and awards.
   `solid` scrolls left, `outline` scrolls right. Placeholder structure from
   the Figma frame. */
export const titles = {
  solid: [
    "ITEQs Manager",
    "Associate SQL Developer for Data Engineer",
    "AWS Certified Cloud Practitioner",
    "First Place, National Hackathon",
    "Dean's Lister",
    "Google Data Analytics Certified",
  ],
  outline: [
    "Best Capstone Project",
    "Speaker, Regional Tech Conference",
    "Meta Front-End Developer",
    "Data Engineer Associate",
    "Azure Fundamentals",
    "Hackathon Winner",
  ],
} as const;
