/* Projects (DESIGN.md 7.4, 8, 11). One entry per project. Media lives in
   public/projects/<slug>/ and is referenced from the site root, e.g.
   src: "/projects/barkstudy/demo.mp4". An empty src keeps the placeholder
   frame. Exactly one project should be featured. */
export type Project = {
  slug: string;
  index: number; // 1-based, shown as 04 on the card
  title: string;
  category: string;
  featured?: boolean;
  summary: string;
  cover?: string; // card image on the home page; defaults to the first screenshot
  meta: { role: string; year: string; timeline: string; team: string; client?: string; status: string };
  video: { src: string; poster: string; duration: string };
  overview: string[];
  features: { title: string; text: string }[];
  screenshots: { src: string; caption: string }[];
  tech: string[];
  repo: { url: string; description: string; license?: string; stars?: number; forks?: number; language?: string };
  liveUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "barkstudy",
    index: 1,
    title: "BarkStudy",
    category: "DESKTOP APP",
    featured: true,
    summary: "A Windows study app where a dog named Pandesal walks your title bars and escalates when you ignore your flashcards.",
    meta: { role: "Full-stack Developer", year: "2026", timeline: "Ongoing, started Oct 2026", team: "Solo project", client: "Personal, open source", status: "In development" },
    video: { src: "/projects/barkstudy/demo.mp4", poster: "/projects/barkstudy/poster.webp", duration: "0:22" },
    overview: [
      "Flashcard apps are easy to ignore. BarkStudy puts a dog on your real window title bars that schedules reviews with spaced repetition and gets louder when you skip them, while staying inside an intensity cap you set and always being escapable.",
      "The hard part was making a pet that can bark and run laps around your windows provably safe. The rules live in a pure TypeScript engine with a finite state machine, and eight invariants are checked by exhaustive state exploration and property-based tests. It reads window positions only, never titles or contents, and the one network call is the update check.",
    ],
    features: [
      { title: "Pandesal on your title bars", text: "A dog that walks along real window title bars, barks, and digs at the one you are avoiding studying in." },
      { title: "Spaced repetition", text: "Flashcards are scheduled with the FSRS algorithm so reviews land when you are about to forget." },
      { title: "Escalation with a cap", text: "Ignoring cards raises the dog's intensity, but never past the cap you set, and Esc always stops him." },
      { title: "Verified safety rules", text: "A rule-layer state machine with eight invariants, checked by exhaustive exploration and fast-check property tests." },
      { title: "Private by design", text: "Reads window positions and owning program only, no titles, contents or screenshots. Decks and history stay on your PC." },
      { title: "Auto-updating installer", text: "Per-user installer with background updates from GitHub Releases that never restart while you study." },
    ],
    screenshots: [
      { src: "/projects/barkstudy/01-pandesal.webp", caption: "SCREENSHOT 01 · PANDESAL ON A WINDOW" },
      { src: "/projects/barkstudy/02-question.webp", caption: "SCREENSHOT 02 · A CARD ARRIVES" },
      { src: "/projects/barkstudy/03-answer.webp", caption: "SCREENSHOT 03 · TYPING AN ANSWER" },
      { src: "/projects/barkstudy/04-correct.webp", caption: "SCREENSHOT 04 · CORRECT, HE GETS A TREAT" },
      { src: "/projects/barkstudy/05-settings.webp", caption: "SCREENSHOT 05 · INTENSITY AND PERSONALITY" },
    ],
    tech: ["Electron", "React", "TypeScript", "ts-fsrs", "Playwright", "fast-check"],
    repo: { url: "github.com/seejjaay/BarkStudy", description: "Electron + React app with a pure TypeScript engine. npm ci, then npm run dev. Windows only.", license: "MIT", language: "TypeScript" },
    liveUrl: "https://github.com/seejjaay/BarkStudy/releases", // installer downloads
  },
  {
    slug: "nikki-and-nicka",
    index: 2,
    title: "Nikki & Nicka",
    category: "MOBILE APP",
    summary: "An offline-first study app where two chibi cat assistants answer from your own notes and documents.",
    meta: { role: "Full-stack Developer", year: "2026", timeline: "Ongoing, started Oct 2026", team: "Solo project", client: "Personal", status: "In development" },
    video: { src: "", poster: "", duration: "0:00" }, // /projects/nikki-and-nicka/demo.mp4, poster.webp
    overview: [
      "Students keep notes, slides and PDFs in different places, and most AI study tools send all of it to the cloud. Nikki & Nicka keeps everything on the device and runs one local AI assistant with two personalities, shown as two cats, that answers from the student's own materials with citations.",
      "It is built milestone by milestone with a written spec, plan and verification report for each. Milestones 0 to 3b are done and handwritten notes are built, running on Windows, Chrome and Android, with iPhone testing set up through cloud builds since there is no Mac.",
    ],
    features: [
      { title: "Library and notes", text: "Subjects, notebooks and pages with tags, favorites, a 30-day trash, autosave and version snapshots." },
      { title: "Markdown editor", text: "Live styling, toolbar, shortcuts, preview and split view, plus pictures and Markdown export." },
      { title: "Document import", text: "PDF, Word, slides, text and pictures by picker, drag-and-drop or camera, with a PDF viewer and note-to-page links." },
      { title: "On-device text recognition", text: "Scans and pictures are read with each platform's own OCR engine, so they are searchable too." },
      { title: "Handwritten notes", text: "Pen, highlighter, erasers and lasso on ruled, grid or dotted paper, staying smooth at 2,000 strokes per page." },
      { title: "Themes and mascots", text: "Eight presets or custom colors behind a contrast guard, with parametric Nikki and Nicka expressions and motion." },
    ],
    screenshots: [
      { src: "/projects/nikki-and-nicka/01-home.webp", caption: "SCREENSHOT 01 · HOME" },
      { src: "/projects/nikki-and-nicka/02-editor.webp", caption: "SCREENSHOT 02 · MARKDOWN EDITOR, SPLIT VIEW" },
      { src: "/projects/nikki-and-nicka/03-ink.webp", caption: "SCREENSHOT 03 · HANDWRITTEN PAGE" },
      { src: "/projects/nikki-and-nicka/04-appearance.webp", caption: "SCREENSHOT 04 · THEMES AND MASCOTS" },
      { src: "/projects/nikki-and-nicka/05-library.webp", caption: "SCREENSHOT 05 · LIBRARY" },
    ],
    tech: ["Flutter", "Dart", "Riverpod", "Drift", "SQLite"],
    repo: { url: "github.com/seejjaay/nikki-and-nicka", description: "Flutter app targeting Android, iOS, Windows, macOS and web. flutter pub get, then flutter run -d windows.", language: "Dart" },
    liveUrl: "",
  },
  {
    slug: "lokal-md",
    index: 3,
    title: "Lokal.MD",
    category: "AI / HEALTHCARE",
    summary: "An offline clinical documentation and medication-safety workstation for rural health units.",
    meta: { role: "Full-stack Developer", year: "2026", timeline: "Hackathon, 2 days", team: "Team PLACEHOLDER, 3 people", client: "AppBuildersPH Hackathon 2026", status: "Functional MVP" },
    video: { src: "/projects/lokal-md/demo.mp4", poster: "/projects/lokal-md/poster.webp", duration: "0:25" },
    overview: [
      "Rural health units and disaster-response missions often have no reliable internet, and sending patient consultations to cloud servers creates real risk under the Data Privacy Act. Lokal.MD does transcription, note writing and medication checks entirely on the clinic's own machine, and it is built so it keeps working when the cloud disappears.",
      "Taglish speech goes through local Whisper, a local Ollama model drafts the SOAP note, and a deterministic SQLite rules engine checks contraindications, allergies and dosages. Every AI line is grounding-checked and a clinician must approve before anything is final. Built for the AppBuildersPH Hackathon 2026, Local AI theme, with 94 passing tests.",
    ],
    features: [
      { title: "Taglish speech to text", text: "faster-whisper runs from local files. Low-confidence lines are marked and a human must clear them." },
      { title: "SOAP notes on-device", text: "A local Llama 3.2 model constrained to a JSON schema, with every AI item grounding-checked against the transcript." },
      { title: "Medication safety rules", text: "A deterministic offline engine checks contraindications, allergies and dosage limits, with evidence and a next step for each finding." },
      { title: "Encrypted by the app", text: "Per-field AES-256-GCM, per-user wrapped keys, a recovery key, a hash-chained audit log and encrypted backups." },
      { title: "Roles and approval", text: "Admin, clinician, staff and pharmacist roles. Only a clinician can approve, and inactivity locks the session." },
      { title: "Air-gapped by construction", text: "Binds to loopback, blocks non-local connections at the process level, and ships an offline self-test." },
    ],
    screenshots: [
      { src: "/projects/lokal-md/01-intake.webp", caption: "SCREENSHOT 01 · INTAKE AND VITALS" },
      { src: "/projects/lokal-md/02-transcript.webp", caption: "SCREENSHOT 02 · TRANSCRIPT" },
      { src: "/projects/lokal-md/03-soap.webp", caption: "SCREENSHOT 03 · AI-DRAFTED SOAP NOTE" },
      { src: "/projects/lokal-md/04-medication.webp", caption: "SCREENSHOT 04 · MEDICATION SAFETY CHECK" },
      { src: "/projects/lokal-md/05-review.webp", caption: "SCREENSHOT 05 · REVIEW AND APPROVAL" },
    ],
    tech: ["Python", "Streamlit", "Ollama", "faster-whisper", "SQLite", "ReportLab"],
    repo: { url: "github.com/AK-Lmn/PLACEHOLDER", description: "Streamlit app. Run setup.bat once online, then run.bat for fully offline use. pytest runs the test suite.", language: "Python" },
    liveUrl: "",
  },
  {
    slug: "verifund-ph",
    index: 4,
    title: "VeriFund PH",
    category: "WEB APP",
    summary: "A social aid distribution platform that gets ayuda to verified people and cuts ghost beneficiaries and duplicate claims.",
    meta: { role: "Full-stack Developer", year: "2026", timeline: "3 weeks", team: "Team Null Set, 4 people", client: "Batang Techno · InterCICSkwela Hackathon 2026", status: "Live" },
    video: { src: "/projects/verifund-ph/demo.mp4", poster: "/projects/verifund-ph/poster.webp", duration: "0:23" },
    overview: [
      "Every time the Philippine government distributes aid, the same problems come back: deceased or non-existent recipients on the list, the same person claiming at several sites, and paper-based checks with long lines. VeriFund PH targets the last mile for local government units.",
      "It has three interfaces: a Citizen Portal with a personal QR card, a mobile-first Field Console where barangay officers register and verify people, and a Management System with a dashboard, scheduling and an append-only audit log. Built by Team Null Set for the Batang Techno · InterCICSkwela Hackathon 2026, Governance challenge, where it finished 3rd Runner Up.",
    ],
    features: [
      { title: "QR identity", text: "Each verified recipient gets a unique QR card, printable or by SMS, with no app to install." },
      { title: "OCR ID scanning", text: "Government IDs are read with AI vision and fill the registration form automatically." },
      { title: "Anti-fraud checks", text: "Duplicate ID, claim-velocity anomaly and face-match checks run on every submission." },
      { title: "Field Console", text: "A mobile-first view for officers to register and scan QR codes for an instant verified or rejected result." },
      { title: "Management dashboard", text: "Live metrics across barangays, beneficiary search and export, and distribution scheduling." },
      { title: "Immutable audit log", text: "Every action is recorded append-only and can be exported as CSV, with OTP login for citizens." },
    ],
    screenshots: [
      { src: "/projects/verifund-ph/01-dashboard.webp", caption: "SCREENSHOT 01 · MANAGEMENT DASHBOARD" },
      { src: "/projects/verifund-ph/02-beneficiaries.webp", caption: "SCREENSHOT 02 · BENEFICIARY DIRECTORY" },
      { src: "/projects/verifund-ph/03-mobile.webp", caption: "SCREENSHOT 03 · CITIZEN QR AND FIELD CONSOLE" },
      { src: "/projects/verifund-ph/04-audit.webp", caption: "SCREENSHOT 04 · IMMUTABLE AUDIT LOG" },
      { src: "/projects/verifund-ph/05-distributions.webp", caption: "SCREENSHOT 05 · DISTRIBUTIONS" },
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Recharts", "Vercel"],
    repo: { url: "github.com/seejjaay/VeriFundPH_Social-Aid-Distribution", description: "Next.js 14 app with Citizen, Field and Management portals. npm install, then npm run dev.", language: "TypeScript" },
    liveUrl: "https://verifundph.vercel.app",
  },
  {
    slug: "orgavents",
    index: 5,
    title: "OrgaVents",
    category: "WEB APP",
    summary: "Campus event management with calendar, venues and registrations, running on a mock backend or a live API.",
    meta: { role: "Full-stack Developer", year: "2026", timeline: "2 weeks", team: "Team of 4", client: "Course project", status: "Complete" },
    video: { src: "/projects/orgavents/demo.mp4", poster: "/projects/orgavents/poster.webp", duration: "0:20" },
    overview: [
      "Campus organizations juggle events, venues and sign-ups across chats and spreadsheets. OrgaVents puts events, an event calendar, venue booking, registrations and reports in one app with separate admin, organizer and member roles.",
      "The frontend talks to a dual-mode API client: set one environment flag and it switches between a full localStorage mock, which needs no server for demos, and the live Express and MongoDB backend. That kept the frontend unblocked while the API was still being built.",
    ],
    features: [
      { title: "Event calendar", text: "Browse and filter campus events on a calendar with detail pages and registration." },
      { title: "Role-based access", text: "Admin, organizer and member roles with JWT auth and protected routes." },
      { title: "Venue management", text: "Admins manage venues and events link to them, with a migration script for older events." },
      { title: "Registrations and reports", text: "Members register for events and organizers get reports on attendance." },
      { title: "Mock and live modes", text: "One VITE_USE_MOCK switch swaps a full localStorage backend for the real API, with instant demo logins." },
      { title: "Dark mode and toasts", text: "Theme switching, confirm modals and toast feedback across the app." },
    ],
    screenshots: [
      { src: "/projects/orgavents/01-calendar.webp", caption: "SCREENSHOT 01 · EVENT CALENDAR" },
      { src: "/projects/orgavents/02-event.webp", caption: "SCREENSHOT 02 · EVENT DETAIL" },
      { src: "/projects/orgavents/03-organizer.webp", caption: "SCREENSHOT 03 · ORGANIZER DASHBOARD" },
      { src: "/projects/orgavents/04-reports.webp", caption: "SCREENSHOT 04 · ATTENDANCE REPORTS" },
      { src: "/projects/orgavents/05-events.webp", caption: "SCREENSHOT 05 · ALL EVENTS (ADMIN)" },
    ],
    tech: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
    repo: { url: "github.com/seejjaay/final-project-4-frontend_backend-webdevt", description: "React + Vite frontend and Express + Mongoose API. npm install and npm run dev runs in mock mode with no server.", language: "JavaScript" },
    liveUrl: "",
  },
  {
    slug: "jpcs-site",
    index: 6,
    title: "JPCS Website",
    category: "WEB APP",
    summary: "The official site for the JPCS chapter at DLSL, with events, projects, gallery and an admin panel.",
    meta: { role: "Full-stack Developer and officer in charge", year: "2026", timeline: "13 months, ongoing", team: "Team project", client: "JPCS DLSL", status: "Live" },
    video: { src: "", poster: "", duration: "0:00" }, // /projects/jpcs-site/demo.mp4, poster.webp
    overview: [
      "The chapter needed a public face for its events, projects and officers, and a way for officers to update it without touching code. This is a Next.js site with an animated homepage, a programs section, a calendar and a gallery, plus a protected admin panel for content.",
      "The first version ran on an in-memory placeholder with a hard-coded fallback secret. I developed the site and went on to handle it further, replacing the data layer with Supabase: Postgres tables with row-level security, auth for the admin panel, and storage for images. It has been verified against a local Supabase stack.",
    ],
    features: [
      { title: "Upcoming events carousel", text: "A homepage hero with the next events and links to their Facebook and Instagram posts." },
      { title: "Projects and programs", text: "A projects carousel and a page per program, driven by the database." },
      { title: "Gallery", text: "A homepage carousel and a paginated gallery page with a lightbox." },
      { title: "Calendar", text: "A calendar page listing the chapter's events." },
      { title: "Admin panel", text: "Officers manage events, projects, gallery, officers and incoming messages behind a login." },
      { title: "Supabase backend", text: "Postgres with row-level security, Supabase Auth and Storage, and a contact form inbox with read and unread state." },
    ],
    screenshots: [
      { src: "/projects/jpcs-site/01-hero.webp", caption: "SCREENSHOT 01 · HOME" },
      { src: "/projects/jpcs-site/02-about.webp", caption: "SCREENSHOT 02 · ABOUT, MISSION AND VISION" },
      { src: "/projects/jpcs-site/03-programs.webp", caption: "SCREENSHOT 03 · DEGREE PROGRAMS" },
      { src: "/projects/jpcs-site/04-projects.webp", caption: "SCREENSHOT 04 · PROJECTS CAROUSEL" },
      { src: "/projects/jpcs-site/05-contact.webp", caption: "SCREENSHOT 05 · CONTACT" },
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "GSAP", "Framer Motion"],
    repo: { url: "github.com/dlsl-jpcs/jpcs-site", description: "Next.js 16 App Router site with a Supabase backend. Migrations are in supabase/migrations.", language: "TypeScript" },
    liveUrl: "",
  },
  {
    slug: "santa-for-hire",
    index: 7,
    title: "Santa for Hire",
    category: "WEB APP",
    summary: "A festive booking site for a Santa Claus performer in the Philippines, with services, video greetings and a booking form.",
    meta: { role: "Full-stack Developer", year: "2026", timeline: "5 days", team: "Solo project", client: "Client project", status: "Live" },
    video: { src: "/projects/santa-for-hire/demo.mp4", poster: "/projects/santa-for-hire/poster.webp", duration: "0:24" },
    overview: [
      "A client who performs as Santa Claus needed one page that explains what he offers and makes booking easy, for family gatherings, office parties, mall meet-and-greets and personal video greetings. The site is laid out as chapters: meet Santa, his services, how a visit unfolds, memories from past Christmases, and how to book.",
      "I built it for them in five days with Next.js and Tailwind, keeping the dependencies to a minimum and putting the effort into the festive look: ornaments, falling snow and an arched, keepsake-style photo frame. Booking is a message to Santa's Facebook page, so no data is stored on the site. It now carries real photos from past events, and basic SEO is in place.",
    ],
    features: [
      { title: "Easy booking", text: "A checklist of what to include (kind of visit, date, place, number of kids), then one button that opens Santa's Facebook page to send the message." },
      { title: "Services", text: "Cards for home visits, corporate and brand events, and more, each linking to matching memories." },
      { title: "Video greetings", text: "A section for personal video messages from Santa, with a three-step explanation and a request button." },
      { title: "The Magic Hour", text: "A five-step walkthrough of a visit, from the first message to the memory the family keeps." },
      { title: "Memories and photos", text: "A photo carousel and a memories page with real photos from past events, set in keepsake-style frames." },
      { title: "Festive design", text: "Ornaments, falling snow, a script heading font and a warm cream and red palette across the whole page." },
    ],
    screenshots: [
      { src: "/projects/santa-for-hire/01-hero.webp", caption: "SCREENSHOT 01 · HOME" },
      { src: "/projects/santa-for-hire/02-meet.webp", caption: "SCREENSHOT 02 · MEET SANTA" },
      { src: "/projects/santa-for-hire/03-services.webp", caption: "SCREENSHOT 03 · SERVICES" },
      { src: "/projects/santa-for-hire/04-magic-hour.webp", caption: "SCREENSHOT 04 · THE MAGIC HOUR" },
      { src: "/projects/santa-for-hire/05-booking.webp", caption: "SCREENSHOT 05 · BOOK SANTA" },
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    repo: { url: "github.com/seejjaay/santa-claus-website", description: "Next.js app with a home page and a memories page. npm install, then npm run dev.", language: "TypeScript" },
    liveUrl: "https://santa-claus-ph.vercel.app",
  },
];

/* The image shown on a project's card on the home page. Empty keeps the rings. */
export const coverOf = (p: Project): string => p.cover || p.screenshots[0]?.src || "";
