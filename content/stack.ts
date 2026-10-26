/* The tech I use: one logo node each on the "What I use" network (DESIGN.md 7.5).
   Placeholder list until the real one is supplied (DESIGN.md 13, open decision 4):
   add, remove or reorder freely; the network spreads whatever is here over the
   whole sphere, front and back.

   - label: the short text drawn on the node when there is no icon
   - icon: file name (no extension) in /public/assets/tech; the SVG is painted in
     the theme colour. Leave it out and the label is used instead
   - size: node diameter in Figma px; larger for the tools used most (49 to 74) */
export type Tech = { name: string; label: string; icon?: string; size: number };

export const stack: readonly Tech[] = [
  { name: "Figma", label: "FIGMA", icon: "figma", size: 74 },
  { name: "TypeScript", label: "TS", icon: "typescript", size: 74 },
  { name: "SQL", label: "SQL", icon: "sql", size: 72 },
  { name: "GitHub", label: "GIT", icon: "github", size: 70 },
  { name: "AWS", label: "AWS", icon: "aws", size: 65 },
  { name: "Node.js", label: "NODE", icon: "nodejs", size: 64 },
  { name: "JavaScript", label: "JS", icon: "javascript", size: 62 },
  { name: "CSS", label: "CSS", icon: "css", size: 62 },
  { name: "Docker", label: "DOCK", icon: "docker", size: 60 },
  { name: "Python", label: "PY", icon: "python", size: 55 },
  { name: "REST APIs", label: "API", icon: "api", size: 54 },
  { name: "React", label: "REACT", icon: "react", size: 52 },
  { name: "Next.js", label: "NEXT", icon: "nextjs", size: 49 },
  { name: "HTML", label: "HTML", icon: "html", size: 58 },
  { name: "Tailwind CSS", label: "TW", icon: "tailwind", size: 58 },
  { name: "Supabase", label: "SUPA", icon: "supabase", size: 56 },
  { name: "Vercel", label: "VERCEL", icon: "vercel", size: 52 },
  { name: "MongoDB", label: "MONGO", icon: "mongodb", size: 54 },
  { name: "GraphQL", label: "GQL", icon: "graphql", size: 52 },
  { name: "Linux", label: "LINUX", icon: "linux", size: 50 },
];
