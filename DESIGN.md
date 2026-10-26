# DESIGN.md — NICK.ODE Portfolio (build spec for Claude Code)

This file is the build spec for the portfolio. The matching Figma file is the visual source of truth; this file explains behavior, motion, tokens and structure that stills cannot show.

- **Figma file key:** `lyivE8qd8BlzVDRmFzWD2m` (see section 14 for node IDs)
- **Precedence:** Figma for layout, spacing and copy. This file for motion, interaction, tokens and build decisions. Where they disagree, ask before guessing.
- **Desktop only in Figma (1440 wide).** Mobile and tablet behavior is specified here by rules (section 12), not drawn.

---

## 1. Overview

A black-and-white editorial portfolio for **NICK.ODE**, set against a calm space backdrop. Condensed Oswald headlines, readable Source Serif 4 body, lots of negative space, and scroll-driven set pieces (a laptop that opens, a network that grows, a mountain that disperses, a wave that splits the screen).

**Personality:** professional, cinematic, precise, quiet confidence. Monochrome only, no accent hue.
**Avoid:** color, neon, saturated gradients, playful illustration, clutter, heavy shadows, emoji.

**Experience order:**
1. Intro (plays once, before the portfolio opens)
2. Hero
3. About Me (wave transition in, dot-matrix portrait)
4. Titles divider (two marquees)
5. What I've done (3D laptop, project carousel)
6. What I use (growing network sphere)
7. What I have achieved (two-row marquee + modals)
8. Where I've been so far (mountain disperse, experience accordion)
9. Contact + footer

Plus a **Project Detail** page and two **achievement modals** (certificate, event). Dark and light themes both ship.

---

## 2. Recommended stack

These are recommendations, not requirements from the design. Change them if you prefer.

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS with CSS variables for tokens (section 3) |
| Scroll scenes | GSAP + ScrollTrigger (pin + scrub), MotionPathPlugin for the intro paths |
| Smooth scroll | Lenis, wired to ScrollTrigger |
| 3D | three.js via react-three-fiber (laptop, network sphere) |
| Dot portrait / starfield | Canvas 2D (dots), WebGL points only if performance needs it |
| Fonts | `next/font`: Oswald (500, 600, 400) and Source Serif 4 (400, 400 italic) |
| Content | Typed data files in `/content` (section 11), no CMS for now |

Suggested structure:

```
/app                 (routes: /, /projects/[slug])
/components
  intro/  hero/  about/  divider/  work/  stack/  achievements/  experience/  contact/  ui/
/content             projects.ts  achievements.ts  experience.ts  tech.ts  site.ts
/lib                 scroll.ts  motion.ts  theme.ts
/public/assets       hero/  about/  wave/  mountain/  logos/
```

---

## 3. Design tokens

Defined as CSS variables on `:root` (dark) and overridden for light. Names match the Figma `Colors` variable collection (modes: **Dark**, **Light**).

| Token | Dark | Light |
|---|---|---|
| `--bg` (bg/black) | `#000000` | `#F6F6F6` |
| `--bg-raised` | `#0A0A0A` | `#EDEDED` |
| `--surface` | `#111111` | `#E6E6E6` |
| `--surface-hover` | `#1A1A1A` | `#DEDEDE` |
| `--text` (text/primary) | `#FFFFFF` | `#0A0A0A` |
| `--text-2` (text/secondary) | `#B3B3B3` | `#515151` |
| `--text-muted` | `#7A7A7A` | `#6B6B6B` (Figma shows `#858585`; darkened to pass AA on `#F6F6F6`) |
| `--text-inverse` | `#000000` | `#F6F6F6` |
| `--border` (subtle) | `rgba(255,255,255,.10)` | `rgba(10,10,10,.10)` |
| `--border-strong` | `rgba(255,255,255,.24)` | `rgba(10,10,10,.24)` |

Rules:
- **Light is "ink on paper."** Not pure white; every grey keeps its relative contrast. Primary buttons and active chips flip (white to black) and their text flips with them via `--text-inverse`.
- Never hard-code `#fff`/`#000` in components. Use tokens. The only exceptions are the certificate sheet (always a light sheet with dark ink) and the intro flash (section 7.0).
- Theme switching: `data-theme="dark|light"` on `<html>`. Default follows `prefers-color-scheme`; a user choice is stored in `localStorage` and wins. Add a small theme toggle (sun/moon icon button, line icon) at the right end of the nav. **Not drawn in Figma; this is a proposal.** Avoid a flash of wrong theme with an inline script in `<head>`.
- Decorative colors in the light Figma frames were remapped by the formula `v' = 0.965 − 0.925·v` per channel (white becomes `#0A0A0A`, black becomes `#F6F6F6`). Apply the same inversion to decorative art (stars, laptop body, network lines) by driving them from tokens or `currentColor`.

Other tokens:
- Radius: 4px (buttons, tags), 8px (cards, panels), 16px (marquee cards).
- Easing: `--ease: cubic-bezier(0.22, 1, 0.36, 1)`.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Container: 1200px max, content column starts at x=120 in the 1440 frame; side padding 24px mobile, 48px tablet, 120px (or `calc((100vw - 1200px)/2)`) desktop.

---

## 4. Typography

Two families only. Oswald for short and structural text, Source Serif 4 for anything read as a sentence.

| Style | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Wordmark | Oswald | 24.8vw (357px at 1440) | 600 | Uppercase, `line-height: .95`, no letter-spacing |
| Section title (H2) | Oswald | `clamp(36px, 5vw, 64px)` | 500 | Uppercase, `letter-spacing: .04em` |
| Card title (H3) | Oswald | 24–28px | 500 | Title case or uppercase, `.03em` |
| Eyebrow / label | Oswald | 12–14px | 400 | Uppercase, `.18em`, muted |
| Body large | Source Serif 4 | 20px | 400 | `line-height: 1.7`, `--text-2` |
| Body | Source Serif 4 | 17–18px | 400 | `line-height: 1.7` |
| Caption / meta | Source Serif 4 | 14px | 400 italic | muted |
| Button / nav | Oswald | 14px | 500 | Uppercase, `.12em` |

Paragraphs max about 65 characters wide. Wait for fonts before starting the intro (`document.fonts.ready`).

---

## 5. Global systems

### 5.1 Space background ("Smooth Space")
Fixed, full-viewport, behind everything. Sections are transparent so stars show through; cards use translucent surfaces with backdrop blur.
- Base `--bg` with a faint radial vignette.
- Starfield: three layers of dots (small/medium/large) with slow parallax drift (60–120s loops) and different scroll speeds.
- One or two huge blurred haze clouds at 3–6% opacity.
- Optional rare thin shooting star every 15–25s.
- In light mode the stars become faint ink dust (dark specks at low opacity); do not remove them.
- `prefers-reduced-motion`: freeze the drift.

### 5.2 Navigation
Fixed top bar, transparent with backdrop blur, 1px bottom border (`--border`). Left: logo `NICK.ODE` (Oswald). Right links in this order and wording:
`ABOUT` · `WHAT I'VE DONE` · `WHAT I USE` · `WHAT I HAVE ACHIEVED` · `WHERE I'VE BEEN SO FAR` · `CONTACT`
Active link uses `--text` with a 1px underline; others `--text-muted`. Active state follows scroll position. Collapses to a minimal menu on mobile. Theme toggle at far right (section 3).

### 5.3 Section headers
Eyebrow with number, big Oswald title, 1px divider (`--border`) beneath, left-aligned.
- `02 — SELECTED WORK` / WHAT I'VE DONE
- `03 — TECH STACK` / WHAT I USE
- `04 — ACHIEVEMENTS` / WHAT I HAVE ACHIEVED
- `05 — EXPERIENCE` / WHERE I'VE BEEN SO FAR
- `06 — CONTACT` / LET'S WORK TOGETHER
About uses the eyebrow `DISCOVER` and a giant faded `01` numeral instead.

### 5.4 Components
- **Primary button:** solid `--text` background, `--text-inverse` text, Oswald uppercase, 4px radius. Hover: lift 2px and soft glow (dark) or soft shadow (light).
- **Secondary button:** transparent, 1px `--border-strong`, `--text`. Hover: border to full `--text`, 6% fill.
- **Text link:** animated 1px underline growing from the left. Arrow links slide the arrow 4px on hover.
- **Card:** translucent `--surface` (about 70%), 1px `--border`, 8px radius, 24–32px padding. Hover: border to `--border-strong`, rise 4px, 400ms.
- **Tag/chip:** rectangular (4px), 1px `--border`, Oswald 12px uppercase, muted. Active chip is solid `--text` with `--text-inverse`.
- **Round icon button:** 40px circle, 1px `--border-strong`, line icon 1.5px stroke.
- Icons: thin line icons, 20–24px.

### 5.5 Scroll architecture
All set pieces are **pinned and scrubbed** by scroll progress (0 to 1), never time-based, unless stated. Use one ScrollTrigger per scene with `pin: true`, `scrub: true`. Lenis drives scroll. Pin lengths: About wave 300vh, What I've done 400vh, What I use 300vh, Experience 200vh.
`prefers-reduced-motion`: no pins and no scrubbing. Show each scene's final state, cross-fade between sections.

---

## 6. Page: Intro (before the portfolio opens)

Plays once per visit (flag in `sessionStorage`), skippable. Full-screen overlay (`position: fixed`, above everything, page scroll locked) with the same background as the site. Runs about **6.3 seconds**, time-based.

**Wordmark:** `NICK.ODE`, same font, size and position as the hero's solid wordmark (24.8vw, left 3.47vw, top 33.4% of the hero stage) so the letters that land here are exactly the hero letters. Build it as one text line split into per-letter inline-block spans; do not change the font metrics when splitting.

Measured Oswald 600 advances at 357px (use for slot checks): N 198, I 104, C 197, K 197, `.` 83, O 200, D 205, E 157 (total 1341).

| # | Letter | Time (s) | Motion | Easing |
|---|---|---|---|---|
| 1 | N | 0.00–0.70 | Builds in place with a clip-path reveal bottom to top behind a 1.5px scan line, over a faint 1px outline of the letter | expo.out |
| 2 | I | 0.55–1.15 | Falls from above the viewport (`translateY(-100vh)` to 0), lands with an 8px squash-and-bounce | ease-in (`cubic-bezier(.55,0,1,.45)`) |
| 3 | C | 1.00–1.80 | Slithers in from the far left along the lower band in a damped sine wave, tilting 50% of the path tangent, then curls up into its slot | power2.out |
| 4 | K | 1.70–2.20 | **Proposed (the brief skipped K).** Left-to-right clip-path wipe behind a vertical scan line | power2.out |
| 5 | O | 2.10–2.80 | Starts as a mini O (22% scale) off the right edge, flies in on a shallow arc into the O slot | power2.inOut |
| 5b | O | 2.80–3.20 | Expands from 22% to full size with overshoot (1.12 then 1.0) and a faint dashed shock ring | back.out |
| 6 | D | 3.10–3.90 | Enters from the top-left, spiralling 1.75 turns toward its slot; rotation 630° to 0°, scale .4 to 1 | power3.out |
| 7 | E | 3.80–4.60 | Cut into 18 clipped fragments (3 columns × 6 rows of copies of the E). They start scattered across the whole viewport with random rotation (±200°) and opacity (.45–1), then fly home. Per-fragment random delay 0–0.35s, about 30% start at home | back.out(1.4) |
| 8 | `.` | 4.50–5.40 | The dot (same Oswald glyph, about 51px square at full size) drops in from above to the top of an ellipse around the wordmark, circles it once clockwise, speeding up | sine.inOut, accelerating |
| 9 | slam | 5.40–5.55 | Dot dives into its slot in 150ms (power4.in). On impact: wordmark shakes ±6px for 120ms, three rings expand and fade (0.5s), 12 short impact lines burst out | power4.in |
| 10 | flash | 5.55–5.70 | Full-screen radial flash from the dot goes to 100% in 0.15s | linear |
| 11 | handoff | 5.70–6.30 | Under the flash, remove the intro layer and mount the portfolio at the top. Flash fades out over 0.6s, revealing the hero | ease |

Details:
- **Flash color:** white in dark mode. In light mode use an **ink-black flash** (150ms), because white would not register on a light page. The Figma intro board shows both (cards 11 and 12 are the light versions).
- Corner labels and nav fade in after handoff, with the hero's own entrance animation.
- **Skip:** small `SKIP` control bottom-right (Oswald 12px, tracked). Skipping jumps straight to the 5.70s handoff.
- **Reduced motion:** skip the choreography, show a 0.6s fade from the wordmark to the hero.
- Use GSAP `timeline` with labels at each start time so the whole thing can be scrubbed and tested.

---

## 7. Page: Home sections

### 7.1 Hero
A **1440×900 stage** (aspect-ratio 16/10) positioned in percentages so all layers stay locked together; center it vertically on taller viewports, and scale with width. Layer order, back to front:

1. **Solid wordmark** `NICK.ODE`, `--text`, 24.8vw. At 1440: left 50px, top 301px (3.47vw, 33.4%).
2. **Portrait cutout:** the sitting photo, grayscale, background removed. At 1440: left 18px, top 222px, width 1044px (1.25%, 24.7%, 72.5%). The face overlaps the middle letters (K and O); the body and hand sit in front of the letters.
3. **Outline wordmark** on top, 1.5px stroke, no fill, **clipped to the portrait silhouette**. So where a letter crosses the person it shows as an outline over them; elsewhere the solid wordmark shows. Implement with the silhouette as an SVG `clipPath`/CSS mask (path data in `hero_mask_path`, 570×424 viewBox, to be regenerated from the final cutout).
4. **Corner labels** (Oswald, uppercase, tracked, small): top-left `[YOUR ROLE]`, top-right a long thin arrow `→` linking to About (slides right on hover), bottom-left `YOUR FULL NAME`, bottom-right `YOURWEBSITE.COM`.
5. **Scroll cue** bottom center (`SCROLL` + a thin line). The hand/shoe slightly overlaps it; nudge the cue or the photo if it collides.

**Entrance (after the intro handoff):** letters rise and fade in with a stagger, portrait fades in slowly.

**Hover color reveal (required):** the portrait is black and white by default. While the cursor is over the image, a **circle around the cursor shows the true color** of the photo.
- Two stacked copies of the cutout: grayscale on the bottom, full color on top.
- The color copy is revealed with a radial `mask-image` centered on the pointer: radius **about 140px** (100px on touch), soft feathered edge (about 40% falloff, no hard circle).
- The circle grows from 0 to full radius in about 250ms on enter and shrinks back on leave. The center follows the pointer with lerp about 0.18 so it has a slight weight.
- The color layer must stay **clipped to the silhouette**: color never spills onto the background or text, and the outline wordmark stays above it.
- Touch: tap or drag reveals color under the finger and fades out about 600ms after release.
- Reduced motion: show the circle immediately with no growth animation, no lerp.
- Needs the **full-resolution color cutout** and its matching grayscale (assets, section 10).
- Light mode: identical behavior; the cutout sits on paper.
- Figma storyboard: board `77:230` (idle, hover, at the edge, light mode). It uses a real color crop of the photo for illustration; the build needs the full-resolution color and grayscale cutouts.

### 7.2 About Me
Entered through the **wave transition** (7.2.1). Layout (1440): portrait left, content right, giant faded `01` numeral far right (outlined, about 6–10% opacity).
- **Left (about 40%):** the **dot-matrix portrait** (7.2.2), in a 440×560 frame with 1px `--border` and a faint offset frame line behind it.
- **Right:** eyebrow `DISCOVER`, title `ABOUT ME`, short 32px underline, intro paragraph (4–5 lines, Source Serif 4, `--text-2`), then an info panel (1px `--border-strong`, 4px radius, 24px padding) with a two-column key/value grid: Name, Age, Phone, Address, Experience, Freelance (Available), Email, Socials. Keys Oswald small uppercase; values Source Serif 4. Then a primary `DOWNLOAD CV` button with a download icon.
- Mobile: portrait stacks above text, grid becomes one column.

#### 7.2.1 Wave transition (scroll, pinned 300vh)
Hokusai's *The Great Wave off Kanagawa* (public domain), pure greyscale, never colorized.
- 0–0.45: wave `translateY` from +65vh to −4vh; the title `ABOUT ME` rides on the crest and moves at 0.6× the wave speed (parallax) until it reaches viewport center, then pins.
- 0.45–0.70: wave scales 1.0 to 1.1 (origin bottom-left), slow drift; title stays centered with `mix-blend-mode: difference` so it stays black and white over foam and sky.
- 0.70–1.00: the viewport splits along the vertical center seam; left half `translateX(0 → −100%)`, right half `(0 → +100%)`, `--ease`. About is already mounted behind and fades up with an 80ms stagger.
- Reduced motion: static wave as a divider, cross-fade into About.

#### 7.2.2 Dot-matrix portrait (canvas)
Source: the standing photo, grayscale cutout, CLAHE plus gamma 0.78, converted to a tone-level grid.
- Grid: **74 columns × 107 rows**, hex-staggered (row pitch 5.2px, column pitch 6px), **5,062 dots**. Dot radius `0.45 + level × 0.3` px for tone levels 0–9 (radius 0.75–3.15 in the board spec at 2×). Dots are `--text`-colored on the frame (dark mode: light dots on near-black; light mode: dark dots on paper).
- Pre-bake the level grid to JSON (`about_rows`) and render on `<canvas>`, devicePixelRatio aware.
- **Idle:** 6s breathing, radius ±6%.
- **Pointer/touch:** dots within **110px (140px on touch)** are pushed radially up to 44px and shrink to 50%; spring back on release (stiffness 0.08, damping 0.82). Use `pointermove`/`touchmove` with passive listeners.
- **Scroll 0–40% of the About scroll range:** sinusoidal ripple (±8px, about 140px wavelength) travels down the figure; dots below 75% height shrink and sink.
- **Scroll 40–80%:** each dot gets a seeded random vector (mulberry32), drifts up and fades to 85%; lower dots scatter first, face last.
- **Scroll 80–100%:** remaining dots exit, handing over to the next section.
- Reduced motion: idle state only, no spring or scatter.

### 7.3 Titles divider
Sits directly **below About Me**, a full-bleed band with two infinite marquees containing titles and achievements: top row scrolls **left** (solid text), bottom row scrolls **right** (outlined text), offset so items don't align, separated by small dot markers. Slow constant speed, edges fade out. Hover pauses. Items come from `/content/site.ts → titles[]` (e.g. "Associate SQL Developer for Data Engineer", "AWS Certified Cloud Practitioner", "Data Engineer Associate", "Azure Fundamentals", "…Manager").

### 7.4 What I've done (3D laptop, pinned 400vh)
Eyebrow `02 — SELECTED WORK`, title `WHAT I'VE DONE`. A 3D laptop (silver aluminium body in dark mode; same object in light) sits **closed** in the middle. As the user scrolls the lid opens; **only once it's open** does the project carousel appear on the screen, then the camera pushes in so the cards are large enough to read.
- Build in three.js or CSS 3D: perspective 1800px, camera elevation about 12°, lid rotates on the rear hinge. Idle: ±1° slow float on the closed laptop.
- 0–0.35: lid `rotateX 0° → 105°`, `--ease`; screen emissive 0 to 1; carousel layer hidden and non-interactive.
- 0.35–0.55: carousel fades/slides in on the screen (`translateY 24px → 0`, 700ms feel, 80ms stagger on cards).
- 0.55–1.00: dolly-in, laptop scale 1.0 to 1.35 plus translate so the screen fills the viewport. Cards are **landscape, about 800×500** (large enough to read). Wheel/drag now scrubs the carousel; the pin releases at the end of the carousel.
- **Carousel:** landscape project cards, center card large and bright, neighbors peeking, dimmed. Card content: index (`04`), cover (placeholder: concentric rings), `FEATURED` or category label, project title (Oswald), `VIEW PROJECT →`. Below: prev/next circular buttons and a dot/pill indicator. Screen header: `WHAT I'VE DONE` left, `04 / 07` right.
- Clicking a card opens the Project Detail page.
- Reduced motion: laptop already open, carousel visible, no pin.

### 7.5 What I use (network sphere, pinned 300vh)
Eyebrow `03 — TECH STACK`, title `WHAT I USE`. A 3D node-network sphere, about 600–700px, centered.
- **Structure:** roughly spherical graph of connected nodes. Large circular logo nodes (1.5px ring, filled with `--bg`, monochrome logo inside) and small solid dot nodes at intersections. Edges vary 1px to 6px and 15–80% opacity; depth cue: back edges 15%, mid 27%, front 50%.
- **Growth on scroll:** the model starts as one pulsing root node. Scroll progress drives a growth value 0 to 7 (one unit per graph generation).
  - An edge of generation *g* starts growing at growth = *g−1* and finishes at *g* (`--ease`); a child's edges start only once the child node has appeared.
  - A bright 5px dot with soft glow leads each growing line; nodes fade/scale in (0 to 1) the moment their incoming line arrives.
  - Cross-links appear with the generation of their later endpoint.
  - 0.85–1.00: logo nodes pop in (scale .6 to 1, 60ms stagger).
- **After the pin releases:** drag to spin on any axis with inertia, easing back to a slow auto-rotation. Front nodes larger and brighter, back nodes smaller and dimmer. Hover a logo node: scale 1.15×, brighten connected edges, show label (tech name, Oswald).
- Expand button (translucent rounded square, diagonal-arrows icon, bottom-right) opens a larger view.
- Logos rendered monochrome using `currentColor`/token (white in dark, ink in light). Larger nodes for most-used tools. Examples: AWS, GitHub, Python, Figma, SQL, Docker.
- Reduced motion / low power: show the finished network as a static image.

### 7.6 What I have achieved
Eyebrow `04 — ACHIEVEMENTS`, title `WHAT I HAVE ACHIEVED`. **Two infinite rows of cards:** top row scrolls **left**, bottom row scrolls **right**, offset so cards don't align; a faint third row below at low opacity and blurred for depth. No stat numbers (removed). Every card is a certificate or an event.
- **Card (16px radius, translucent surface, backdrop blur, 1px border):** small thumbnail left; meta line `CERTIFICATE · DATACAMP · 2026` (or `EVENT · HACKATHON · 2025`, `AWARD · CAPSTONE · 2024`); title (Oswald); `VIEW DETAILS →`.
- Hover pauses the row and brightens the card (border strong, lift 4px). Edges fade via gradient mask. Rows stop on keyboard focus.
- Clicking a card opens the matching modal (7.6.1 or 7.6.2).

#### 7.6.1 Certificate modal
Centered modal (about 1120×680) over a scrim (`rgba(bg, .72)`), close `✕` top-right (round button). Two columns:
- **Left:** certificate image on a light sheet (placeholder: `CERTIFICATE OF COMPLETION`, title, signature line, seal), `CERTIFICATE IMAGE · CLICK TO ZOOM`, and a round expand button bottom-right for zoom. The sheet is always light with dark ink; in light mode add a hairline border.
- **Right:** tag chips (`CERTIFICATE`, `DATA ENGINEERING`, `SQL`, `2026`), title (Oswald, large), a 2×2 meta grid (Issuer, Issued, Credential ID, Expires), divider, description (Source Serif 4), `VERIFY CREDENTIAL ↗` link, then `SHARED ON` with a primary `LINKEDIN POST ↗` button and round icon buttons for Facebook, Instagram and copy link (the original LinkedIn/social post of the achievement).
- Esc and scrim click close; focus is trapped; return focus to the opener.

#### 7.6.2 Event modal (photo carousel)
Same shell. **Left:** photo carousel with `02 / 05` counter pill (top-left), prev/next round buttons, image placeholder, and a thumbnail strip of 5 (active thumbnail has a strong border). **Right:** tags (`EVENT`, `SPEAKER`, `TECH CONFERENCE`, `2025`), title, meta grid (Event, Date, Location, Role), description, then `SEE THE POST` with the same `LINKEDIN POST ↗` button and social icons. Arrow keys and swipe change photos.

### 7.7 Where I've been so far (pinned 200vh, then accordion)
Eyebrow `05 — EXPERIENCE`, title `WHERE I'VE BEEN SO FAR`. The section **opens as a mountain** (an original ink illustration: two peaks, a pine-lined lake and rocky shores) under the title. Scrolling breaks it apart and reveals the experience list. The mountain is **not a background**.
- **Pin:** `position: sticky` about 200vh; scroll progress 0–1 drives everything.
- **Mountain:** the illustration (2400×1500, 16:10) is cut into a **24 × 15 grid of equal tiles** (100px each at native size; scale with the container). Skip tiles with no ink (detect at build time from the PNG alpha) so only tiles that contain lines animate; expect about 210 of 360 (the storyboard shows 211). Each tile gets a seeded random drift (up to 320px sideways, 260px up), rotation (±80°) and fade. Top peaks start first. Tiles are clipped copies of the same image offset by `(-x, -y)`.
- **Orb:** a **170px circle** with `mix-blend-mode: difference` (white fill, radial-gradient falloff) follows the pointer (lerp 0.15), inverting the illustration and any text it crosses. Needs a solid-filled container, inside a clipped frame. On touch it follows the finger. Fades out by 50% scroll.
- **Reveal:** from 40% the header and list fade and slide up into place; by 85% the tiles are gone and the pin releases.
- **Two assets, one drawing:** `mountain-ink-white` (white ink, transparent background) in dark mode and `mountain-ink-dark` (near-black ink, transparent background) in light mode. Swap by theme (`<picture>`/CSS variable), no CSS invert. The orb works the same in both themes. Both are also provided as SVG; use the PNGs for the tiles (cheaper to clip) and the SVG for any static or reduced-motion display.
- The Figma storyboard (`50:59`) shows the new illustration in all states, including a light-mode row (cards 05 and 06, dark ink on paper). Image width in Figma is only 960px (720px for light); use the 2400px files in the build.
- Reduced motion: skip the mountain, show the final section.

**Experience list (accordion):** each row is a collapsed header: period (`2025 — PRESENT`, Oswald muted), role (`ITEQs Manager`, Oswald), `Company Name · City, Country` (Source Serif italic), and a round chevron button. The first item is expanded by default; only one open at a time (animate height, 400ms `--ease`). Expanded content, two columns:
- **WHAT I DID:** 3 bullet lines with an em-dash marker (Source Serif 4).
- **PROJECTS & EVENTS IN THIS ROLE:** stacked mini-cards, each with a tag (`PROJECT` solid chip or `EVENT` outlined chip), date, title (Oswald), one-line description, and a `↗` link. Project cards link to the Project Detail page; event cards open the event modal.
Rows are separated by 1px `--border`. The expanded row sits on `--surface`.

### 7.8 Contact
Eyebrow `06 — CONTACT`. Oversized Oswald headline `LET'S WORK TOGETHER`, a short Source Serif 4 invitation. Two columns: left has **EMAIL**, **LOCATION**, **SOCIALS** (GitHub, LinkedIn, Instagram as text links with `↗`); right has a minimal form (Name, Email, Message) with underline inputs (1px bottom border at `--border-strong`, full `--text` on focus) and a primary `SEND MESSAGE →` button. Validate client-side; the submit target is an open decision (section 13).

### 7.9 Footer
`© 2026 NICK.ODE. ALL RIGHTS RESERVED.` left, `BACK TO TOP ↑` right, 1px top border.

---

## 8. Page: Project Detail (`/projects/[slug]`)

Same nav (Projects active), same background. Order of content:
1. **Back link** `← BACK TO PROJECTS`, then eyebrow `FEATURED · WEB APP`, giant Oswald title (`PROJECT FOUR`), one-line summary, and a 4-up meta row: **Role**, **Year**, **Timeline**, **Team** (Oswald label over Source Serif value). Buttons: primary `VIEW LIVE SITE ↗`, secondary `GITHUB REPO`.
2. **Video:** 16:9 player card with `PROJECT DEMO · 1:24` label, large round play button, progress bar (`0:28 / 1:24`), volume and fullscreen controls. Use a native `<video>` with custom controls (poster image, `preload="metadata"`); a short demo clip per project.
3. **About the project** (`01 — OVERVIEW`): two paragraphs left (problem, approach/result) and a bordered facts table right: Role, Client, Year, Duration, Status.
4. **Key features** (`02 — FEATURES`): 3×2 grid of cards, each with a number (`01`–`06`), title (Oswald) and a two-line description (e.g. Real-time updates, Secure login, Responsive design, Admin dashboard, Search & filters, Fast performance).
5. **Screenshots** (`03 — GALLERY`): masonry-ish grid: row one has one large (about 2/3) and one tall (1/3), row two has three equal. Each has a caption label (`SCREENSHOT 01 · HOME`). Click opens a lightbox.
6. **Built with** (`04 — TECH USED`): row of tag chips.
7. **GitHub repository** (`05 — SOURCE CODE`): wide card with the `github.com/username/project-four` path, short description, stars, forks, language dot, license, and a primary `VIEW ON GITHUB ↗` button. Optionally fetch stars/forks from the GitHub API at build time.
8. **Previous / Next project** links at the bottom (`← PREVIOUS PROJECT` / `NEXT PROJECT →`) with large titles. Then the footer.

---

## 9. Motion catalog (quick reference)

| Scene | Driver | Length | Section |
|---|---|---|---|
| Intro | time | 6.3s | 6 |
| Hero hover reveal | pointer | — | 7.1 |
| About wave + split | scroll, pinned | 300vh | 7.2.1 |
| Dot portrait | pointer + scroll | About range | 7.2.2 |
| Titles marquees | time | continuous | 7.3 |
| Laptop opens | scroll, pinned | 400vh | 7.4 |
| Network grows | scroll, pinned | 300vh | 7.5 |
| Achievements marquees | time | continuous | 7.6 |
| Mountain disperse + orb | scroll, pinned + pointer | 200vh | 7.7 |
| Scroll reveals | scroll | — | fade up 24px, 700ms, 80ms stagger |

General rules: ease with `--ease`; hover transitions 300–400ms; no bouncing except where specified; honor `prefers-reduced-motion` everywhere (each scene above lists its fallback). Never animate layout properties in scrubbed scenes; use `transform` and `opacity`.

---

## 10. Assets

| Asset | Notes |
|---|---|
| Hero cutout (color + grayscale) | Sitting photo, background removed, transparent PNG/WebP, about 2000px wide. **The Figma file embeds a low-res grayscale version (580×425 upscaled); replace with the full-res originals.** Needs the matching silhouette SVG path |
| About portrait | Standing photo, grayscale cutout. Pre-bake the 74×107 level grid to JSON |
| Great Wave | Hokusai (public domain), pure greyscale, about 2000px; separate foam/sky masks if needed for the blend title |
| Mountain illustration | Original ink art made for this project (no third-party license): `mountain-ink-white.png/.svg` and `mountain-ink-dark.png/.svg`, 2400×1500, transparent background. Place in `public/assets/mountain/`. The earlier stock sketch and the Kranjska Gora Triglav photo are **not** used. Pre-slice into 24×15 tiles only if performance requires |
| Tech logos | Monochrome SVGs (SVG sprites, `currentColor`) |
| Project covers, videos, screenshots, certificate images, event photos | Placeholders until the user supplies real ones |
| Fonts | Oswald, Source Serif 4 via `next/font` |

Optimize everything: AVIF/WebP, explicit dimensions, lazy-load below the fold, preload only the hero cutout and the two fonts.

---

## 11. Content model

Placeholders in the Figma file are real structure, not final copy. Keep copy in `/content`.

```ts
type Project = { slug: string; index: number; title: string; category: string; summary: string;
  meta: { role: string; year: string; timeline: string; team: string; client?: string; status: string };
  video: { src: string; poster: string; duration: string };
  overview: string[]; features: { title: string; text: string }[];
  screenshots: { src: string; caption: string }[]; tech: string[];
  repo: { url: string; description: string; license?: string }; liveUrl?: string };

type Achievement = { id: string; kind: 'certificate' | 'event' | 'award'; title: string; issuer: string; year: string;
  tags: string[]; thumb: string; description: string; posts: { linkedin?: string; facebook?: string; instagram?: string };
  // certificate only
  credentialId?: string; expires?: string; verifyUrl?: string; image?: string;
  // event only
  event?: { name: string; date: string; location: string; role: string }; photos?: string[] };

type Role = { id: string; period: string; title: string; company: string; location: string; bullets: string[];
  related: { type: 'project' | 'event'; refId: string; date: string; title: string; text: string }[] };

type Tech = { name: string; logo: string; weight: 1 | 2 | 3 }; // weight sets node size
```

Site-level: name `NICK.ODE`, role, full name, website, email, location, socials, CV file URL, `titles[]` for the divider, About info fields.

---

## 12. Responsive behavior

Figma shows 1440 desktop only. Rules for the rest:
- Breakpoints: 640, 1024, 1280.
- **Hero:** keep the stage proportions; on narrow screens switch to a stacked layout (wordmark across the top at about 22vw, cutout below overlapping it, corner labels in the corners). Keep the outline-over-silhouette trick.
- **About:** portrait above text; dot grid scales, pointer radius 140px on touch.
- **Laptop:** keep the open/dolly scene but cap the final scale so the screen fits; one centered card with peeks. Swipe to browse.
- **Network:** smaller (about 340px), touch-drag, labels on tap.
- **Marquees:** same two rows, smaller cards, slower speed.
- **Experience:** accordion unchanged; the two expanded columns stack; the mountain scene runs shorter (150vh).
- **Modals:** become full-screen sheets on mobile; image on top, details below.
- **Nav:** collapses to a menu button; theme toggle stays visible.
- Touch targets at least 44px. Pinned scenes use `100svh`.

---

## 13. Accessibility, performance, open decisions

**Accessibility**
- WCAG AA contrast in both themes (this is why light `--text-muted` is `#6B6B6B`).
- Visible focus: 2px `--text` outline with 2px offset. Semantic headings in order, alt text on images, labeled form fields.
- Modals: focus trap, Esc to close, restore focus, `aria-modal`. Accordion uses buttons with `aria-expanded`/`aria-controls`.
- Marquees pause on hover and focus and have a reduced-motion static alternative.
- Canvas and 3D scenes get a text equivalent (`aria-label` summarizing, plus the logo list as visually hidden text).

**Performance**
- Targets: LCP under 2.5s on the hero cutout, 60fps scenes on a mid laptop. Cap devicePixelRatio at 2 for canvas/WebGL. Pause offscreen canvases and the starfield when not visible. Dispose three.js resources on unmount.
- Lazy-mount heavy scenes (laptop, network) as they approach the viewport.

**Open decisions (ask the user before building each)**
1. **Theme toggle:** placement and icon (proposed in 5.2, not designed).
2. **K animation** in the intro (proposed wipe in 6).
3. **Contact form backend** (email service, serverless route, or `mailto:`).
4. **Real content:** copy, project list, videos, certificates, photos, tech list.
5. **Mobile layouts** are rule-based only; confirm before polishing.
6. **Prototype links** between frames in Figma are not wired; flows are described here instead.

---

## 14. Figma map

File key `lyivE8qd8BlzVDRmFzWD2m`. Use `get_design_context` on these node IDs when implementing.

| What | Node |
|---|---|
| Portfolio, dark, desktop 1440 | `3:22` (children: Space background `9:94`, Nav `3:23`, Hero `3:24`, About `3:25`, Titles divider `20:59`, What I've done `3:26`, What I use `3:27`, Achievements `3:28`, Experience `3:29`, Contact `3:30`, Footer `3:31`) |
| Portfolio, light | `59:173` |
| Project Detail, dark / light | `15:2` / `59:1255` |
| Certificate modal, dark / light | `18:2` / `59:1832` |
| Event modal, dark / light | `18:176` / `59:2006` |
| Experience Item component set | `19:80` |
| Hero portrait (masked) | `41:60` (inside Hero) |
| About dot field | `42:59` (inside About portrait frame `5:3`) |
| Storyboard: About wave transition | `31:59` |
| Storyboard: laptop opens | `34:115` |
| Storyboard: network grows | `37:203` |
| Board: About dot portrait motion | `43:124` |
| Board: Experience mountain disperse (dark states 01–04, light states 05–06) | `50:59` |
| Board: Hero hover color reveal (4 states, includes light) | `77:230` |
| Board: Intro NICK.ODE (cards 11–12 are light mode) | `54:173` |
| Light mode tokens and rules | `59:2182` |
| Colors variable collection | `VariableCollectionId:3:2` (modes Dark `3:0`, Light `59:0`) |
| Mountain template (white ink) / orb template | `47:59` / `47:62` |

---

## 15. Build order and acceptance

Build in this order, checking each against Figma and the section above before moving on:
1. Project scaffold, tokens, fonts, theme switching (dark/light), nav, footer.
2. Space background.
3. Hero static (all layers, mask) then hover color reveal.
4. About static, then dot portrait interactions, then wave transition.
5. Titles divider.
6. Achievements marquees and both modals.
7. Experience accordion (static), then mountain disperse and orb.
8. What I've done: carousel first (flat), then the laptop scene.
9. What I use: static network first, then growth scene.
10. Project Detail page and routing from the carousel and Experience cards.
11. Contact form.
12. Intro sequence last (it depends on the final hero wordmark metrics), then reduced-motion and responsive passes.

**Acceptance checklist**
- [ ] Dark and light both pass a visual diff against the Figma frames at 1440.
- [ ] Hero wordmark in the intro and the hero land on exactly the same pixels (no jump at handoff).
- [ ] Hero hover shows true color in a soft circle, clipped to the silhouette.
- [ ] Every pinned scene releases cleanly and scrubs backwards.
- [ ] All motion has a `prefers-reduced-motion` fallback.
- [ ] Keyboard: nav, marquee cards, modals, accordion, carousels, and the intro Skip control are reachable and operable.
- [ ] Lighthouse accessibility 95+; no layout shift from fonts or images.

---

## 16. Do's and don'ts

**Do:** stay monochrome, use big confident Oswald headlines with breathing room, keep the starfield visible, keep motion slow and eased, drive scenes by scroll progress, use tokens for every color.

**Don't:** add any accent color, use heavy shadows or tinted glassmorphism, add typefaces, crowd sections, hard-code `#fff`/`#000`, or colorize the wave or mountain art (the hero's hover reveal is the one deliberate exception to "all images are grayscale").
