import { socials } from "./socials";

/* Contact details shown on the Contact section (DESIGN.md 7.8). The socials come
   from content/socials.ts. The address shown
   here is only for display: where form messages are delivered is set by the
   CONTACT_TO environment variable (see .env.example). */
export const contact = {
  email: "cjnickorosales@gmail.com",
  location: "Rosario, Batangas, Philippines",
  socials: socials.map(({ label, href }) => ({ label: label.toUpperCase(), href })),
} as const;
