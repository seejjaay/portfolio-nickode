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
    <section id="hero" className="@container relative z-[1] -mt-[var(--nav-h)] h-svh overflow-hidden">
      <div className="hero-stage @container">
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
      </div>

      {/* The role label belongs to the viewport, not the stage. */}
      <p className={`${label} left-6 top-[calc(var(--nav-h)+40px)] sm:left-12`}>{site.role}</p>
    </section>
  );
}
