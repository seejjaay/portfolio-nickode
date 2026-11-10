import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeatureGrid } from "@/components/project/FeatureGrid";
import { Gallery } from "@/components/project/Gallery";
import { Overview } from "@/components/project/Overview";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectNav } from "@/components/project/ProjectNav";
import { RepoCard } from "@/components/project/RepoCard";
import { TechChips } from "@/components/project/TechChips";
import { VideoPlayer } from "@/components/project/VideoPlayer";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { projects } from "@/content/projects";

/* Project Detail (DESIGN.md 8, Figma 15:2 dark / 59:1255 light): one static page
   per project in content/projects.ts. Sections sit 96px apart. */
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: `${project.title} — NICK.ODE`, description: project.summary } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  const project = projects[i];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];

  // Keyed by slug so going previous/next remounts the page and plays it again.
  return (
    <div key={slug} className="flex flex-col gap-24">
      <ScrollProgress />
      <ProjectHeader project={project} />
      <div data-reveal="zoom" className="-mt-10 px-[var(--gutter)]">
        <VideoPlayer video={project.video} title={project.title} />
      </div>
      <Overview project={project} />
      <FeatureGrid features={project.features} />
      <Gallery screenshots={project.screenshots} />
      <TechChips tech={project.tech} />
      <RepoCard repo={project.repo} />
      <ProjectNav prev={prev} next={next} />
      <Reveal />
    </div>
  );
}
