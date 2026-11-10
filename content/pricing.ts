/* Freelance price list (DESIGN.md 8.1). Mirrors the PDF in public/pricing and
   mileplan/templates/prices.json: when a price changes, change all three. */

export type Package = {
  name: string;
  from: number;
  timeline: string;
  summary: string;
  inclusions?: string[];
};

export type PriceGroup = {
  id: string;
  title: string;
  kicker: string;
  /** "compact" cards drop the inclusions list (the simple and student tier). */
  layout: "full" | "compact";
  packages: Package[];
};

export const priceGroups: PriceGroup[] = [
  {
    id: "web",
    title: "WEB DEVELOPMENT",
    kicker: "WEBSITES & WEB APPS",
    layout: "full",
    packages: [
      {
        name: "Landing page",
        from: 3500,
        timeline: "3–5 days",
        summary: "One focused page to introduce a person, product or event.",
        inclusions: [
          "1 responsive page (mobile, tablet, desktop)",
          "Contact form or call-to-action",
          "Basic SEO and fast loading",
          "Deployment on your domain",
        ],
      },
      {
        name: "Business / portfolio site",
        from: 10000,
        timeline: "1–2 weeks",
        summary: "A complete site for a business, organization or personal brand.",
        inclusions: [
          "Up to 5 custom-designed pages",
          "Contact form and social links",
          "Light animations, SEO setup",
          "Dark / light theme on request",
          "Deployment and launch support",
        ],
      },
      {
        name: "Custom web application",
        from: 35000,
        timeline: "3–6 weeks",
        summary: "A full-stack app built around how you work.",
        inclusions: [
          "Frontend, backend and database",
          "User login and roles",
          "Admin dashboard",
          "API and third-party integrations",
          "Deployment and documentation",
        ],
      },
    ],
  },
  {
    id: "apps",
    title: "APPLICATION DEVELOPMENT",
    kicker: "SOFTWARE & SYSTEMS",
    layout: "full",
    packages: [
      {
        name: "Tools & automation",
        from: 5000,
        timeline: "3–7 days",
        summary: "Small programs that remove repetitive work.",
        inclusions: [
          "Scripts and workflow automation",
          "Data cleanup and reports",
          "Python or UiPath",
          "Short usage guide",
        ],
      },
      {
        name: "Desktop / mobile app",
        from: 40000,
        timeline: "4–8 weeks",
        summary: "A working app for Windows or mobile.",
        inclusions: [
          "Electron or React Native",
          "Local or cloud database",
          "Clean, easy-to-use interface",
          "Testing and installer / build",
        ],
      },
      {
        name: "System / SaaS platform",
        from: 60000,
        timeline: "6–10 weeks",
        summary: "Multi-user platforms such as event or management systems.",
        inclusions: [
          "Multiple roles and dashboards",
          "Database design and data modeling",
          "Reports and exports",
          "Security basics and deployment",
        ],
      },
    ],
  },
  {
    id: "simple",
    title: "SIMPLE & STUDENT PROJECTS",
    kicker: "SMALL SCOPES, SCHOOL ORGS, PERSONAL USE",
    layout: "compact",
    packages: [
      {
        name: "Simple website",
        from: 1500,
        timeline: "1–3 days",
        summary: "Up to 3 static pages, responsive, with a contact section.",
      },
      {
        name: "Basic web app",
        from: 5000,
        timeline: "1–2 weeks",
        summary: "Simple login and a database with add, edit and delete pages.",
      },
      {
        name: "Basic app",
        from: 8000,
        timeline: "2–3 weeks",
        summary: "A simple desktop or mobile app with local storage.",
      },
      {
        name: "Bug fixes",
        from: 500,
        timeline: "1–2 days",
        summary: "Fix a specific bug or issue in your own project, per issue.",
      },
    ],
  },
];

export const addOns: { label: string; price: string }[] = [
  { label: "UI/UX mockups before development", price: "from ₱2,500" },
  { label: "Extra page", price: "₱1,000" },
  { label: "Extra revision round", price: "₱800" },
  { label: "Domain and hosting setup", price: "₱800" },
  { label: "Monthly maintenance and updates", price: "from ₱1,500 / mo" },
  { label: "Rush delivery", price: "+30%" },
];

export const terms: { label: string; text: string }[] = [
  { label: "Start", text: "We discuss your goals, then I send a written quote and timeline." },
  {
    label: "Payment",
    text: "50% deposit to begin, 50% on delivery. Larger projects can be split into milestones.",
  },
  { label: "Revisions", text: "2 rounds are included in every package." },
  {
    label: "Not included",
    text: "Domain, hosting and paid third-party services are billed at cost.",
  },
  {
    label: "Delivery",
    text: "The finished, deployed project is handed over once final payment is received.",
  },
];

export const pricingNote = "Starting prices. Final price depends on scope, complexity and timeline. Prices valid through 2026.";

export const priceListPdf = {
  label: "DOWNLOAD PRICE LIST (PDF)",
  href: "/pricing/CJ-Nicko-Rosales-Freelance-Price-List.pdf",
  file: "CJ-Nicko-Rosales-Freelance-Price-List.pdf",
};
