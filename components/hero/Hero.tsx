import { site } from "@/content/site";
import { HeroPortrait } from "./HeroPortrait";
import { portraitBoxStyle, wordmarkBoxStyle, wordmarkInPortraitStyle } from "./geometry";

/* Hero (DESIGN.md 7.1). A 1440x900 stage kept in proportion, with layers back
   to front: solid wordmark, grayscale portrait (plus the hover color layer),
   outline wordmark clipped to the silhouette, then corner labels and cue. */
const label =
  "intro-fade pointer-events-none absolute font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text";

export function Hero() {
  return (
    <section
      id="hero"
      className="flex min-h-[calc(100svh-var(--nav-h))] items-center justify-center"
    >
      <div className="hero-stage @container relative aspect-[16/10] w-full overflow-hidden max-sm:aspect-auto max-sm:h-[calc(100svh-var(--nav-h))] max-sm:min-h-[560px]">
        <h1
          className="absolute whitespace-nowrap font-display font-semibold uppercase leading-[0.95] text-text"
          style={wordmarkBoxStyle}
        >
          {site.name}
        </h1>

        <HeroPortrait />

        {/* Outline wordmark: the same text, stroke only, visible only where it
            crosses the person. The mask is the cutout's own alpha. */}
        <div aria-hidden className="hero-silhouette pointer-events-none absolute" style={portraitBoxStyle}>
          <span
            className="absolute whitespace-nowrap font-display font-semibold uppercase leading-[0.95] text-transparent [-webkit-text-stroke:1.5px_var(--text)]"
            style={wordmarkInPortraitStyle}
          >
            {site.name}
          </span>
        </div>

        <p className={`${label} left-6 top-10 sm:left-12`}>{site.role}</p>
        <a
          href="#about"
          aria-label="Scroll to About"
          className="intro-fade group absolute right-6 top-10 -my-3 py-3 text-text sm:right-12"
        >
          <span
            aria-hidden
            className="icon-next-arrow transition-transform duration-300 ease-brand group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </a>
        <p className={`${label} bottom-[60.4px] left-6 sm:left-12`}>{site.fullName}</p>
        <p className={`${label} bottom-[60.4px] right-6 sm:right-12`}>{site.website}</p>

        <div
          aria-hidden
          className="intro-fade pointer-events-none absolute bottom-[10px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[13.8px]"
        >
          <span className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text">
            SCROLL
          </span>
          <span className="h-7 w-px bg-border-strong" />
        </div>
      </div>
    </section>
  );
}
