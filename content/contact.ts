/* Contact details shown on the Contact section (DESIGN.md 7.8). Placeholders until
   the real ones are supplied (DESIGN.md 13, open decision 4). The address shown
   here is only for display: where form messages are delivered is set by the
   CONTACT_TO environment variable (see .env.example). */
export const contact = {
  email: "you@email.com",
  location: "City, Country",
  socials: [
    { label: "GITHUB", href: "https://github.com/username" },
    { label: "LINKEDIN", href: "https://www.linkedin.com/in/username" },
    { label: "INSTAGRAM", href: "https://www.instagram.com/username" },
  ],
} as const;
