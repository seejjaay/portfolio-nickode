# DESIGN.md — NICK.ODE Portfolio (build spec for Claude Code)

This file is the build spec for the portfolio. The matching Figma file is the visual source of truth; this file explains behavior, motion, tokens and structure that stills cannot show.

- **Figma file key:** `lyivE8qd8BlzVDRmFzWD2m` (see section 14 for node IDs)
- **Precedence:** Figma for layout, spacing and copy. This file for motion, interaction, tokens and build decisions. Where they disagree, ask before guessing.
- **Figma shows desktop at 1440 wide.** Mobile (390) frames are specified in section 12.1 and are being added to Figma; until they exist, section 12 is the source for mobile. Tablet is by rules only.
- **Status:** build steps 1–12 are done. A second change batch (section 15, steps 13–19: hero fit, shorter intro, services section, mountain redraw + dust, mobile pass, two removals) is specified here and **not yet built**. Where the build departs from the spec below, the relevant section is edited in place and section 17 lists every departure, the batch, and what is still open (including which Figma frames are still stale).

---

## 1. Overview

A black-and-white editorial portfolio for **NICK.ODE**, set against a calm space backdrop. Condensed Oswald headlines, readable Source Serif 4 body, lots of negative space, and scroll-driven set pieces (a folder that deals out cards, a laptop that opens, a network that grows, a mountain that turns to dust, a wave that splits the screen).

**Personality:** professional, cinematic, precise, quiet confidence. Monochrome only, no accent hue.
**Avoid:** color, neon, saturated gradients, playful illustration, clutter, heavy shadows, emoji.

**Experience order:**
1. Intro (plays once, before the portfolio opens)
2. Hero
3. About Me (wave transition in, dot-matrix portrait)
4. Titles divider (two marquees)
5. What can I offer (services: a folder that opens and deals out a deck of cards)
6. What I've done (3D laptop, project carousel)
7. What I use (growing network sphere)
8. What I have achieved (two-row marquee + modals)
9. Where I've been so far (mountain turns to dust, experience accordion)
10. Contact + footer

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
| 3D | three.js via react-three-fiber (laptop only; the network sphere is Canvas 2D) |
| Dot portrait / starfield / network | Canvas 2D (dots), WebGL points only if performance needs it |
| Fonts | `next/font`: Oswald (500, 600, 400) and Source Serif 4 (400, 400 italic) |
| Content | Typed data files in `/content` (section 11), no CMS for now |

Suggested structure:

```
/app                 (routes: /, /projects/[slug])
/components
  intro/  hero/  about/  divider/  services/  work/  stack/  achievements/  experience/  contact/  project/  ui/
/content             projects.ts  achievements.ts  experience.ts  stack.ts  site.ts  about.ts  contact.ts  services.ts
                     about-dots.json  mountain-tiles.json   (baked at build time; tiles go away with the dust effect, section 7.7)
/lib                 scroll.ts  motion.ts  theme.ts  canvas.ts  carousel.ts  contact.ts  intro.ts
                     mountain.ts  network.ts  useMarquee.ts  useModalDialog.ts
/app/api/contact     POST route (section 7.8)
/public/assets       hero/  wave/  mountain/  tech/  icons/  ui/  source/  (originals, untouched)
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
- **Added during the build** (all in `globals.css`, themed where they differ): `--outline-stroke` (0.5px dark, 1px light, for outlined type), `--blend-white` (the difference-blend title and orb), `--thumb-from/to` and `--media-from/to` (placeholder art), `--overlay-btn`, `--shadow-modal`, `--vignette`, the `--laptop-*` set (deck, edge, rim, hinge, notch, key, body) and the `--screen-*` set (the laptop screen UI, which stays dark in both themes), plus `--nav-h` (64px), `--container` and `--gutter`. Components must still use tokens only.
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
**As built (replaces the original top bar at every width):** no bar. The `NICK.ODE` logo and a burger float over the page; the burger opens a right-side dialog drawer (GSAP: burger morphs to a close icon in place, scrim fades, panel slides, links stagger in; reversed a little faster to close). The page is **not** scroll-locked while the drawer is open. Links, in this order and wording:
`ABOUT` · `WHAT I OFFER` · `WHAT I'VE DONE` · `WHAT I USE` · `WHAT I HAVE ACHIEVED` · `WHERE I'VE BEEN SO FAR` · `CONTACT`
Active link uses `--text` with a 1px underline; others `--text-muted`. Active state follows scroll position (the last section whose top has crossed a probe line at 40% of the viewport); About is active until a later section takes over. On `/projects/[slug]` the `WHAT I'VE DONE` link is the active one. Links glide to their section (smooth scroll). The theme toggle lives in the drawer.

### 5.3 Section headers
Eyebrow with number, big Oswald title, 1px divider (`--border`) beneath, left-aligned.
- `02 — WHAT I OFFER` / WHAT CAN I OFFER
- `03 — SELECTED WORK` / WHAT I'VE DONE
- `04 — TECH STACK` / WHAT I USE
- `05 — ACHIEVEMENTS` / WHAT I HAVE ACHIEVED
- `06 — EXPERIENCE` / WHERE I'VE BEEN SO FAR
- `07 — CONTACT` / LET'S WORK TOGETHER
About uses the eyebrow `DISCOVER` and no numeral (the giant faded `01` was removed). The old numbers 02–06 each moved down one when services became 02.

### 5.4 Components
- **Primary button:** solid `--text` background, `--text-inverse` text, Oswald uppercase, 4px radius. Hover: lift 2px and soft glow (dark) or soft shadow (light).
- **Secondary button:** transparent, 1px `--border-strong`, `--text`. Hover: border to full `--text`, 6% fill.
- **Text link:** animated 1px underline growing from the left. Arrow links slide the arrow 4px on hover.
- **Card:** translucent `--surface` (about 70%), 1px `--border`, 8px radius, 24–32px padding. Hover: border to `--border-strong`, rise 4px, 400ms.
- **Tag/chip:** rectangular (4px), 1px `--border`, Oswald 12px uppercase, muted. Active chip is solid `--text` with `--text-inverse`.
- **Round icon button:** 40px circle, 1px `--border-strong`, line icon 1.5px stroke.
- Icons: thin line icons, 20–24px.

### 5.5 Scroll architecture
All set pieces are **pinned and scrubbed** by scroll progress (0 to 1), never time-based, unless stated. Use one ScrollTrigger per scene with `pin: true`, `scrub: true`. Lenis drives scroll. Pin lengths: About wave 300vh, What I offer 400vh, What I've done 400vh, What I use 300vh, Experience 200vh (150vh on mobile).
`prefers-reduced-motion`: no pins and no scrubbing. Show each scene's final state, cross-fade between sections.

---

## 6. Page: Intro (before the portfolio opens)

Plays once per visit (flag in `sessionStorage`), skippable. Full-screen overlay (`position: fixed`, above everything, page scroll locked) with the same background as the site. Runs about **3 seconds**, time-based (shortened from 6.3s: the same letters and gestures, condensed and overlapped).

**Wordmark:** `NICK.ODE`, same font, size and position as the hero's solid wordmark (24.8vw, left 3.47vw, top 33.4% of the hero stage) so the letters that land here are exactly the hero letters. Build it as one text line split into per-letter inline-block spans; do not change the font metrics when splitting.

Measured Oswald 600 advances at 357px (use for slot checks): N 198, I 104, C 197, K 197, `.` 83, O 200, D 205, E 157 (total 1341).

| # | Letter | Time (s) | Motion | Easing |
|---|---|---|---|---|
| 1 | N | 0.00–0.40 | Builds in place with a clip-path reveal bottom to top behind a 1.5px scan line, over a faint 1px outline of the letter | expo.out |
| 2 | I | 0.20–0.60 | Falls from above the viewport (`translateY(-100vh)` to 0), lands with a 6px squash-and-bounce | ease-in (`cubic-bezier(.55,0,1,.45)`) |
| 3 | C | 0.40–0.90 | Slithers in from the far left along the lower band in a damped sine wave (one swing instead of two), tilting 50% of the path tangent, then curls up into its slot | power2.out |
| 4 | K | 0.60–1.00 | Left-to-right clip-path wipe behind a vertical scan line | power2.out |
| 5 | O | 0.80–1.40 | Merged fly and expand: starts as a mini O (22% scale) off the right edge, flies in on a shallow arc and grows to full size on the way, with one overshoot (1.1 then 1.0) and the faint dashed shock ring on arrival | power2.inOut, then back.out |
| 6 | D | 1.00–1.60 | Enters from the top-left, spiralling 1 turn toward its slot; rotation 360° to 0°, scale .4 to 1 | power3.out |
| 7 | E | 1.20–1.90 | Cut into 18 clipped fragments (3 columns × 6 rows of copies of the E). They start scattered across the viewport with random rotation (±200°) and opacity (.45–1), then fly home. Per-fragment random delay 0–0.2s, about 30% start at home | back.out(1.4) |
| 8 | `.` | 1.90–2.30 | The dot (same Oswald glyph, about 51px square at full size) drops in from above and swings **half** an orbit around the wordmark (no full circle), speeding up | sine.inOut, accelerating |
| 9 | slam | 2.30–2.40 | Dot dives into its slot in 100ms (power4.in). On impact: wordmark shakes ±6px for 100ms, three rings expand and fade (0.4s), 12 short impact lines burst out | power4.in |
| 10 | flash | 2.40–2.55 | Full-screen radial flash from the dot goes to 100% in 0.15s | linear |
| 11 | handoff | 2.55–3.00 | Under the flash, remove the intro layer and mount the portfolio at the top. Flash fades out over 0.45s, revealing the hero | ease |

Why it is shorter: every letter keeps its gesture, but each starts before the previous one finishes (N and I overlap by 0.2s, and so on), the O's two beats are one move, the D spins once, the dot orbits half a turn, and the flash and handoff are tighter. No new framework: it is still one GSAP timeline.

Details:
- **Flash color:** white in dark mode. In light mode use an **ink-black flash** (150ms), because white would not register on a light page. The Figma intro board shows both (cards 11 and 12 are the light versions). **That board still shows the earlier 6.3s timeline; the table above supersedes it until the board is redrawn.**
- Corner labels and nav fade in after handoff, with the hero's own entrance animation.
- **Skip:** small `SKIP` control bottom-right (Oswald 12px, tracked). Skipping jumps straight to the 2.40s flash and handoff.
- **Reduced motion:** skip the choreography, show a 0.6s fade from the wordmark to the hero.
- Use GSAP `timeline` with labels at each start time so the whole thing can be scrubbed and tested.

---

## 7. Page: Home sections

### 7.1 Hero
A **1440×900 stage** (aspect-ratio 16/10) positioned in percentages so all layers stay locked together. **Fit, no partial scroll:** the hero section is exactly `100svh` tall, so the next section never peeks in at the bottom. The stage is scaled to **fit** (contain) the viewport (width `min(100vw, 160svh)`), so the whole composition is always visible with nothing cropped: centered horizontally (on a viewport wider than 16:10 the page background shows at the sides) and sitting on the hero's bottom edge (on a viewport taller than 16:10 the spare height goes above, under the nav, so the photo's cut-off never floats). The role label is anchored to the **viewport** edge (with the gutter as inset), not to the stage. Layer order, back to front:

1. **Solid wordmark** `NICK.ODE`, `--text`, 24.8vw. At 1440: left 50px, top 301px (3.47vw, 33.4%).
2. **Portrait cutout:** the sitting photo, grayscale, background removed. At 1440: left 18px, top 222px, width 1044px (1.25%, 24.7%, 72.5%). The face overlaps the middle letters (K and O); the body and hand sit in front of the letters.
3. **Outline wordmark** on top, 1.5px stroke, no fill, **clipped to the portrait silhouette**. So where a letter crosses the person it shows as an outline over them; elsewhere the solid wordmark shows. **As built:** no SVG path; the silhouette is the grayscale cutout's own alpha, used as a CSS `mask` (`.hero-silhouette`), so the mask can never drift from the photo. Geometry is CSS variables in container units (`cqw`) on `.hero-stage`, so wordmark, portrait and mask stay locked. Cutouts are cropped from the source to Figma's framing and exported as 2088×1530 WebP (`hero-gray.webp`, `hero-color.webp`); the originals are untouched in `assets/source/`.
4. **Role label** (Oswald, uppercase, tracked, small): top-left `[YOUR ROLE]` only. **Removed:** the top-right arrow, the bottom-left name, the bottom-right website and the scroll cue. The top-right corner and the whole bottom edge are empty (the burger floats top-right).

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
Entered through the **wave transition** (7.2.1). Layout (1440): portrait left, content right. **No numeral:** the giant faded `01` that sat on the far right was removed, leave that edge clear.
- **Left (about 40%):** the **dot-matrix portrait** (7.2.2), in a 440×560 frame with 1px `--border` and a faint offset frame line behind it.
- **Right:** eyebrow `DISCOVER`, title `ABOUT ME`, short 32px underline, intro paragraph (4–5 lines, Source Serif 4, `--text-2`), then an info panel (1px `--border-strong`, 4px radius, 24px padding) with a two-column key/value grid: Name, Age, Phone, Address, Experience, Freelance (Available), Email, Socials. Keys Oswald small uppercase; values Source Serif 4. Then a primary `DOWNLOAD CV` button with a download icon.
- Mobile: portrait stacks above text, grid becomes one column.

#### 7.2.1 Wave transition (scroll, pinned 300vh)
Hokusai's *The Great Wave off Kanagawa* (public domain), pure greyscale, never colorized.
**As built** (numbers fitted to the Figma storyboard stills at 0, 25, 60 and 80%, node `31:59`; the stills won over the prose that was here before):
- 0–0.60: wave `translateY` from +67vh to −4vh; the title `ABOUT ME` rides on the crest at about half the wave's speed until it reaches viewport center, then pins.
- 0.60–1.00: wave scales 1.0 to 1.1 (origin bottom-left), slow drift; title stays centered with `mix-blend-mode: difference` so it stays black and white over foam and sky.
- 0.70–1.00: the viewport splits along the vertical center seam and the halves slide apart with ease-out-cubic (the 80% still has them 500px apart). About is already mounted behind and fades up on a timed stagger.
- The wave art is rebuilt from the public-domain print (Japanese text removed) in a dark version and an ink-on-paper light version, flowed by a WebGL shader. Lenis drives scroll and is wired to ScrollTrigger.
- Under 768px the pin is dropped (see section 17).
- **Hero to About seam (as built):** the stage opens with its top 61% empty (the title starts at 0.611 of the stage), so on the pinned desktop version the About section is pulled up 52svh under the hero (the hero is above it in z-order). That leaves about 120px between the hero's bottom edge and the title. The hero photo fades out over the stage's last 14% (on phones, over the cutout's last 16%), and the wave's top is a mask fade, not a `--bg` overlay. In light mode the halves' paper background fades in over the stage's top 20%, so the tucked-under edge never shows as a step against the vignette. The pin uses `anticipatePin: 1`. On phones About is pulled up into the hero's empty bottom, leaving about 150px under the photo.
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
Sits directly **below About Me**, a full-bleed band with two infinite marquees containing titles and achievements: top row scrolls **left** (solid text), bottom row scrolls **right** (outlined text), offset so items don't align, separated by small dot markers. Slow constant speed (measured 64 px/s top, 50 px/s bottom, CSS-animated loop), edges fade out. **Hover does not pause** (deliberate departure from the original spec). The outline row uses `--outline-stroke`. Reduced motion shows a compact wrapped list instead of the marquees. Items come from `/content/site.ts → titles[]` (e.g. "Associate SQL Developer for Data Engineer", "AWS Certified Cloud Practitioner", "Data Engineer Associate", "Azure Fundamentals", "…Manager").

### 7.3.1 What can I offer (services; pinned 400vh)
Sits directly **below the titles divider**. Eyebrow `02 — WHAT I OFFER`, title `WHAT CAN I OFFER` (the drawer link is `WHAT I OFFER`). A **closed folder** sits centered; as you scroll, its flap opens and the cards burst out **one at a time**, each settling into a pinned deck. Services are **placeholders** for now; they live in `content/services.ts`.

```ts
type Service = { id: string; index: number; title: string; summary: string; tags: string[] };
```

Placeholder services, in order: **Data Engineering & Pipelines**, **SQL & Database Development**, **Cloud Setup (AWS / Azure)**, **Web Development**, **UI/UX & Prototyping**. Each has a two-line summary and 2–4 tag chips (e.g. SQL, Python, AWS).

- **Folder** (CSS 3D or plain 2D transforms, no three.js): a back panel, a front flap hinged on its bottom edge, and a tab with the label `SERVICES · 05`. Built from tokens only (`--surface`, `--border-strong`, 8px radius). Idle: a slow ±1° float while closed.
- **Cards:** landscape, about 560×340 on desktop (342×400 portrait on mobile). Content: index (`01`–`05`, Oswald muted), title (Oswald), summary (Source Serif 4), tag chips. Same translucent surface and 1px border as other cards.
- **Scroll map (progress 0–1 over the pin):**
  - 0–0.15: flap opens, `rotateX 0° → −100°`, `--ease`; folder shifts down about 12% so the deck has room above it.
  - 0.15–1.00: five card beats, 0.17 each. Beat *n*: the card starts inside the folder mouth (`translateY` +60% of its height, scale .9, rotate ±6°, opacity 0), springs up and out with one small overshoot, then settles into the deck.
  - **Deck:** the newest card is on top and fully bright; each earlier card steps 28px up and back, scale ×.96 per step, opacity to .6, so you read a stack that grows upward. After the last beat the deck holds for a short tail before the pin releases.
- Only `transform` and `opacity` animate. One ScrollTrigger, `pin: true`, `scrub: true`.
- **As built:** progress comes from the ScrollTrigger's `onUpdate`, so it is scroll-locked without a `scrub` tween. The scene is a fixed design box (700×900 desktop, 390×844 mobile) scaled by `--svc-k` to fit short or narrow stages. Cards scale about their top edge, so each step back shows a full 28px. The dimming to .6 is a `--bg` veil over the card, not card opacity, so a dimmed card still hides the ones behind it. Each beat is 75% move and 25% hold, so the last card holds for about 0.04 before the pin releases. Cards are opaque (the translucent `--surface` laid over `--bg`) so the deck never shows text through itself. Reduced motion shows the cards as a list above the open folder.
- Reduced motion: no pin; show the folder open with the five cards as a plain stacked list.
- Mobile: same scene, `100svh` pin, folder about 300px wide, cards full width minus the 24px gutters. See section 12.1.

### 7.4 What I've done (3D laptop, pinned 400vh)
Eyebrow `03 — SELECTED WORK`, title `WHAT I'VE DONE`. A 3D laptop (silver aluminium body in dark mode; same object in light) sits **closed** in the middle. As the user scrolls the lid opens; **only once it's open** does the project carousel appear on the screen, then the camera pushes in so the cards are large enough to read.
- Build in three.js or CSS 3D: perspective 1800px, camera elevation about 12°, lid rotates on the rear hinge. Idle: ±1° slow float on the closed laptop.
- 0–0.35: lid `rotateX 0° → 105°`, `--ease`; screen emissive 0 to 1; carousel layer hidden and non-interactive.
- 0.35–0.55: carousel fades/slides in on the screen (`translateY 24px → 0`, 700ms feel, 80ms stagger on cards).
- 0.55–1.00: ~~dolly-in~~ **removed on purpose (not wanted).** The laptop stays open and still; scrolling moves the carousel from card 1 to card N and the pin releases at the last card. Cards are **landscape, about 800×500**.
- **As built:** the laptop is a react-three-fiber model (bevelled aluminium, keys, glass bezel); the carousel stays DOM, projected onto the screen by a synced CSS 3D camera. Once open it stays open however you scroll, up included. Clicking the keyboard closes it (carousel fades, then the lid shuts); it stays shut until you click the laptop or scroll back to the very top of the scene and come down again. The scene starts loading 4s after page load on an idle slot (or immediately when scrolling within 200% of the viewport) and the carousel waits for the first rendered frame. Under 900px the laptop is replaced by a project card list (section 17).
- **Carousel:** landscape project cards, center card large and bright, neighbors peeking, dimmed. Card content: index (`04`), cover (placeholder: concentric rings), `FEATURED` or category label, project title (Oswald), `VIEW PROJECT →`. Below: prev/next circular buttons and a dot/pill indicator. Screen header: `WHAT I'VE DONE` left, `04 / 07` right.
- Clicking a card opens the Project Detail page.
- Reduced motion: laptop already open, carousel visible, no pin.

### 7.5 What I use (network sphere, pinned 300vh)
Eyebrow `04 — TECH STACK`, title `WHAT I USE`. A 3D node-network sphere, about 600–700px, centered.
- **Structure:** roughly spherical graph of connected nodes. Large circular logo nodes (1.5px ring, filled with `--bg`, monochrome logo inside) and small solid dot nodes at intersections. Edges vary 1px to 6px and 15–80% opacity; depth cue: back edges 15%, mid 27%, front 50%.
- **Growth on scroll:** the model starts as one pulsing root node. Scroll progress drives a growth value 0 to 7 (one unit per graph generation).
  - An edge of generation *g* starts growing at growth = *g−1* and finishes at *g* (`--ease`); a child's edges start only once the child node has appeared.
  - A bright 5px dot with soft glow leads each growing line; nodes fade/scale in (0 to 1) the moment their incoming line arrives.
  - Cross-links appear with the generation of their later endpoint.
  - 0.85–1.00: logo nodes pop in (scale .6 to 1, 60ms stagger).
- **As built:** the graph is procedural (root at the front pole, generations by angular distance, gap-filled so there are no bare patches) on Canvas 2D, not three.js. The big section title sits dim behind the sphere. Once complete it stays complete when you scroll back up. The tech list is `content/stack.ts` with monochrome SVGs in `public/assets/tech`.
- **After the pin releases:** drag to spin on any axis with inertia, easing back to a slow auto-rotation. Front nodes larger and brighter, back nodes smaller and dimmer. Hover a logo node: scale 1.15×, brighten connected edges, show label (tech name, Oswald).
- Expand button (translucent rounded square, diagonal-arrows icon, bottom-right) opens a larger view.
- Logos rendered monochrome using `currentColor`/token (white in dark, ink in light). Larger nodes for most-used tools. Examples: AWS, GitHub, Python, Figma, SQL, Docker.
- Reduced motion / low power: show the finished network as a static image.

### 7.6 What I have achieved
Eyebrow `05 — ACHIEVEMENTS`, title `WHAT I HAVE ACHIEVED`. **Two infinite rows of cards:** top row scrolls **left**, bottom row scrolls **right**, offset so cards don't align; a faint third row below at low opacity and blurred for depth. No stat numbers (removed). Every card is a certificate or an event.
- **Card (16px radius, translucent surface, backdrop blur, 1px border):** small thumbnail left; meta line `CERTIFICATE · DATACAMP · 2026` (or `EVENT · HACKATHON · 2025`, `AWARD · CAPSTONE · 2024`); title (Oswald); `VIEW DETAILS →`.
- Hover pauses the row and brightens the card (border strong, lift 4px). Edges fade via gradient mask. Rows stop on keyboard focus.
- Clicking a card opens the matching modal (7.6.1 or 7.6.2).
- **Added:** a `SEE MORE` button opens a filterable list of every achievement, newest first; its rows open the detail modal on top. Cards are buttons whose accessible name comes from their visible text (the loop's duplicate copy is out of the tab order and `aria-hidden`).
- Modals use a native `<dialog>` (focus trap, Esc, focus return) with counted page-scroll locking.

#### 7.6.1 Certificate modal
Centered modal (about 1120×680) over a scrim (`rgba(bg, .72)`), close `✕` top-right (round button). Two columns:
- **Left:** certificate image on a light sheet (placeholder: `CERTIFICATE OF COMPLETION`, title, signature line, seal), `CERTIFICATE IMAGE · CLICK TO ZOOM`, and a round expand button bottom-right for zoom. The sheet is always light with dark ink; in light mode add a hairline border.
- **Right:** tag chips (`CERTIFICATE`, `DATA ENGINEERING`, `SQL`, `2026`), title (Oswald, large), a 2×2 meta grid (Issuer, Issued, Credential ID, Expires), divider, description (Source Serif 4), `VERIFY CREDENTIAL ↗` link, then `SHARED ON` with a primary `LINKEDIN POST ↗` button and round icon buttons for Facebook, Instagram and copy link (the original LinkedIn/social post of the achievement).
- Esc and scrim click close; focus is trapped; return focus to the opener.

#### 7.6.2 Event modal (photo carousel)
Same shell. **Left:** photo carousel with `02 / 05` counter pill (top-left), prev/next round buttons, image placeholder, and a thumbnail strip of 5 (active thumbnail has a strong border). **Right:** tags (`EVENT`, `SPEAKER`, `TECH CONFERENCE`, `2025`), title, meta grid (Event, Date, Location, Role), description, then `SEE THE POST` with the same `LINKEDIN POST ↗` button and social icons. Arrow keys and swipe change photos.

### 7.7 Where I've been so far (pinned 200vh, then accordion)
Eyebrow `06 — EXPERIENCE`, title `WHERE I'VE BEEN SO FAR`. The section **opens as a mountain** (an original ink illustration: two peaks, a pine-lined lake and rocky shores) under the title. Scrolling turns the ink to **dust** that blows away, and the experience list then **condenses out of the dust**. The mountain is **not a background**. This replaces the old tile-drift animation.
- **Pin:** `position: sticky` about 200vh (150vh on mobile); scroll progress 0–1 drives everything.
- **Art (redrawn):** the illustration was redrawn so the stray streaks are gone (they were in the drawing itself: long fills spilling out of ridge and reflection strokes). Files `mountain-ink-white` / `mountain-ink-dark` (PNG and SVG, 2400×1500, transparent) replace the old ones in `public/assets/mountain/`. Swap by theme, no CSS invert.
- **Dust (Canvas 2D, one canvas):** sample the ink pixels of the art at a 720×450 working grid (offscreen canvas at load, or baked). The old `mountain-tiles.json` and tile drift are **removed**. Each ink pixel gets a seeded (mulberry32) random delay, wind, lift and wobble:
  - **Order:** `delay = 0.42·(y/H) + 0.16·rand`, plus 0.28 for solid regions (pine and tree masses), so the peaks go first, then the lower slopes, then the trees. (Solid regions are found with an erosion/dilation mask.)
  - **Progress per speck:** `e = smoothstep` over 0.55 of the global progress after its delay.
  - **Motion:** blown **right and up**: `dx = (150 + 330·rand)·e`, `dy = −(30 + 190·rand)·e`, plus a sine wobble of ±14·e px (all in 720-wide units; scale with the container).
  - **Look:** keep about 55% of the pixels as specks, 18% of those drawn 2px, the rest 1px. Alpha `× (1 − e)^1.1`. White specks in dark mode, ink-black in light mode (same drawing, theme-swapped).
  - **As built:** specks are written into a grid buffer (720-wide units, spanning the whole canvas so dust can leave the illustration's box) and blitted to the canvas in one scaled `drawImage`, nearest-neighbour (about 7ms frames; per-speck `fillRect` was 30ms+). The speck clock is `progress / 0.85 × (last delay + 0.55)`, so with the delays above the last speck still leaves exactly at 0.85. At rest the canvas shows the crisp PNG; it cross-fades to specks over the first 4.5% of progress.
- **Condense:** from about 0.40, about 1,300 incoming specks (restricted to the list's footprint, so it never reads as a starfield) drift **in** from the right and settle while the header and list go from `opacity 0 → 1` and `blur 6px → 0`. By 0.85 the dust is gone and the content is crisp; the pin releases at 1.0.
- **Orb (kept):** a **170px circle** with `mix-blend-mode: difference` (white fill, radial-gradient falloff) follows the pointer (lerp 0.15), inverting the illustration and any text it crosses. Needs a solid-filled container, inside a clipped frame. On touch it follows the finger. Fades out by 50% scroll.
- The Figma storyboard (`50:59`) shows the stills: 01 intro (art), 02 about 30% (dust blowing off), 03 about 75% (content condensing), 04 done, plus a light-mode row (05, 06). The dust stills are pre-rendered sprites that approximate the effect; the build runs the real particles. Figma images are 720px wide; use the 2400px files.
- Reduced motion: skip the mountain and the dust, show the final section.

**Experience list (accordion):** each row is a collapsed header: period (`2025 — PRESENT`, Oswald muted), role (`ITEQs Manager`, Oswald), `Company Name · City, Country` (Source Serif italic), and a round chevron button. The first item is expanded by default; only one open at a time (animate height, 400ms `--ease`). Expanded content, two columns:
- **WHAT I DID:** 3 bullet lines with an em-dash marker (Source Serif 4).
- **PROJECTS & EVENTS IN THIS ROLE:** stacked mini-cards, each with a tag (`PROJECT` solid chip or `EVENT` outlined chip), date, title (Oswald), one-line description, and a `↗` link. Project cards link to the Project Detail page; event cards open the event modal.
Rows are separated by 1px `--border`. The expanded row sits on `--surface`.

### 7.8 Contact
Eyebrow `07 — CONTACT`. Oversized Oswald headline `LET'S WORK TOGETHER`, a short Source Serif 4 invitation. Two columns: left has **EMAIL**, **LOCATION**, **SOCIALS** (GitHub, LinkedIn, Instagram as text links with `↗`); right has a minimal form (Name, Email, Message) with underline inputs (1px bottom border at `--border-strong`, full `--text` on focus) and a primary `SEND MESSAGE →` button. Validate client-side. **Submit target decided:** `POST /api/contact` emails through Resend (honeypot field, fill-time check, rate limit, header-injection safe); `RESEND_API_KEY=dry-run` logs instead of sending; `.env.example` documents the variables. Contact details live in `content/contact.ts`.

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
| Intro | time | 3.0s | 6 |
| Hero hover reveal | pointer | — | 7.1 |
| About wave + split | scroll, pinned | 300vh | 7.2.1 |
| Dot portrait | pointer + scroll | About range | 7.2.2 |
| Titles marquees | time | continuous | 7.3 |
| Services folder + deck | scroll, pinned | 400vh | 7.3.1 |
| Laptop opens | scroll, pinned | 400vh | 7.4 |
| Network grows | scroll, pinned | 300vh | 7.5 |
| Achievements marquees | time | continuous | 7.6 |
| Mountain dust + orb | scroll, pinned + pointer | 200vh (150vh mobile) | 7.7 |
| Scroll reveals | scroll | — | fade up 24px, 700ms, 80ms stagger |

General rules: ease with `--ease`; hover transitions 300–400ms; no bouncing except where specified; honor `prefers-reduced-motion` everywhere (each scene above lists its fallback). Never animate layout properties in scrubbed scenes; use `transform` and `opacity`.

---

## 10. Assets

| Asset | Notes |
|---|---|
| Hero cutout (color + grayscale) | Sitting photo, background removed, transparent PNG/WebP, about 2000px wide. **The Figma file embeds a low-res grayscale version (580×425 upscaled); replace with the full-res originals.**  The mask comes from the cutout's own alpha, so no SVG path is needed |
| About portrait | Standing photo, grayscale cutout. Pre-bake the 74×107 level grid to JSON |
| Great Wave | Hokusai (public domain), pure greyscale, about 2000px; separate foam/sky masks if needed for the blend title |
| Mountain illustration | Original ink art made for this project (no third-party license), **redrawn in the second batch** (streaks fixed): `mountain-ink-white.png/.svg` and `mountain-ink-dark.png/.svg`, 2400×1500, transparent background. Replace the old files in `public/assets/mountain/`. The art feeds the dust effect (7.7); no tiles are baked any more. The earlier stock sketch and the Kranjska Gora Triglav photo are **not** used |
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
- **Hero:** `100svh`, stage fits without cropping (7.1). Under 640px switch to the portrait composition (wordmark lower, cutout about 150cqw wide); the role label stays in the viewport corner. Keep the outline-over-silhouette trick.
- **About:** portrait above text; dot grid scales, pointer radius 140px on touch.
- **Laptop:** under 900px it becomes a project card list (as built; see section 17). Above that, the laptop opens and stays still (no dolly); cap its scale so the screen fits.
- **Network:** smaller (about 340px), touch-drag, labels on tap.
- **Marquees:** same two rows, smaller cards, slower speed.
- **Experience:** accordion unchanged; the two expanded columns stack; the dust scene runs shorter (150vh).
- **Modals:** become full-screen sheets on mobile; image on top, details below.
- **Nav:** the burger drawer at every width. **Theme toggle:** in the drawer footer on desktop; under 768px a 44px round sun/moon button also sits beside the burger so it stays visible (this settles the earlier contradiction between this section and 5.2).
- Touch targets at least 44px. Pinned scenes use `100svh`.

### 12.1 Mobile frames (390 wide, dark and light)
These frames are added to Figma beside the desktop ones (dark row and light row). Status: **to be drawn**; the rules below are the source until then. Gutter 24px, content width 342px. Type at 390: H2 36px, wordmark 24.8vw, body 17px.
- **Intro:** same wordmark scene, scaled by width; Skip bottom-right.
- **Hero:** portrait composition, `100svh`; role top-left, burger and theme toggle top-right.
- **About:** portrait frame full width (440:560), then eyebrow, title, paragraph, info panel as one column, full-width `DOWNLOAD CV`. No wave pin (it is a plain divider).
- **Titles divider:** two marquees, slower, smaller type.
- **What can I offer:** pinned `100svh`; folder about 300px wide; cards 342×400 portrait, same deck behavior.
- **What I've done:** project card list (cover 16:10, index, category, title, `VIEW PROJECT →`), one column.
- **What I use:** network about 340px, drag to spin, tap a logo for its label; the expand button stays.
- **Achievements:** two marquee rows with smaller cards (about 260px wide), slower than desktop; `SEE MORE` full width.
- **Experience:** the mountain and dust scene (150vh), then the accordion with stacked columns.
- **Contact and footer:** one column, full-width inputs and button; footer stacks.
- **Drawer:** full-width panel, links 28px Oswald stacked with the same stagger, theme toggle and close at the bottom and top.
- **Project detail:** one column; meta row 2×2; video full width; features one column; gallery one column with a lightbox; repo card stacked; previous/next stacked.
- **Certificate and event modals:** **full-screen sheets** (`100svh`, slide up from the bottom, sticky 44px close button top-right). Certificate: the sheet image on top (tap to zoom), then chips, title, meta grid (2×2), description, verify link, share row. Event: photo carousel on top (4:3, counter pill, swipe), thumbnail strip scrolling horizontally, then the same details block.

---

## 13. Accessibility, performance, open decisions

**Accessibility**
- WCAG AA contrast in both themes (this is why light `--text-muted` is `#6B6B6B`).
- Visible focus: 2px `--text` outline with 2px offset. Semantic headings in order, alt text on images, labeled form fields.
- Modals: focus trap, Esc to close, restore focus, `aria-modal`. Accordion uses buttons with `aria-expanded`/`aria-controls`.
- Achievement marquees pause on hover and focus; the titles divider keeps moving on hover (7.3). Both have a reduced-motion static alternative.
- Canvas and 3D scenes get a text equivalent (`aria-label` summarizing, plus the logo list as visually hidden text).

**Performance**
- Targets: LCP under 2.5s on the hero cutout, 60fps scenes on a mid laptop. Cap devicePixelRatio at 2 for canvas/WebGL. Pause offscreen canvases and the starfield when not visible. Dispose three.js resources on unmount.
- Lazy-mount heavy scenes (laptop, network) as they approach the viewport.

**Open decisions (ask the user before building each)**
1. ~~**Theme toggle:** placement and icon.~~ Built: sun/moon button in the nav drawer footer.
2. ~~**K animation** in the intro.~~ Built as the proposed left-to-right wipe.
3. ~~**Contact form backend.**~~ Resend via `/api/contact` (section 7.8).
4. **Real content:** copy, project list, videos, certificates, photos, tech list. Still placeholders.
5. **Mobile layouts:** specified in section 12.1 (frames being added to Figma); the gaps from the audit are listed in section 17. Confirm the services copy and the theme-toggle placement before polishing.
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
| Mountain board states (dust, second batch) | `50:63` (01), `50:66` (02, dust out), `50:69` (03, content condensing), `50:72` (04), light `81:231` (05), `81:238` (06). **Image fills on the art and dust layers need re-applying** (see section 17) |
| Services section, dark / light | **Not yet drawn** (to go below the divider `20:59` in `3:22` and `59:173`) |
| Services storyboard (folder open, five card beats) | **Not yet drawn** |
| Mobile frames (390): site, drawer, project detail, certificate and event sheets | **Not yet drawn** (section 12.1) |

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

Steps 1–12 are built and committed.

**Second batch (specified 2026-10-29, not yet built).** Do these in order; each is independent enough to commit on its own:
13. **Removals:** delete the top-right hero arrow and the giant `01` in About (7.1, 7.2). Quick, no risk.
14. **Hero fit:** `100svh` hero, cover-and-crop stage, labels and cue anchored to the viewport (7.1).
15. **Mountain art swap:** replace the four mountain files with the redrawn ones.
16. **Mountain dust:** replace the tile drift with the dust effect and the condense-in; delete `mountain-tiles.json` and its bake script; keep the orb (7.7).
17. **Services section (built):** `content/services.ts`, the folder and deck scene, nav link and renumbered eyebrows (5.2, 5.3, 7.3.1).
18. **Intro:** retime to the 3s timeline (6).
19. **Mobile pass (built):** the 390 frames, the modal sheets, slower marquees, 150vh mountain, visible theme toggle (12.1, 17).

**Acceptance checklist** (state after step 12; the unticked items need a person looking at a real browser)
- [ ] Dark and light both pass a visual diff against the Figma frames at 1440.
- [ ] Hero wordmark in the intro and the hero land on exactly the same pixels (no jump at handoff).
- [ ] Hero hover shows true color in a soft circle, clipped to the silhouette.
- [ ] Every pinned scene releases cleanly and scrubs backwards.
- [x] All motion has a `prefers-reduced-motion` fallback (every scene component checks it).
- [ ] Keyboard: nav, marquee cards, modals, accordion, carousels, and the intro Skip control are reachable and operable.
- [x] Lighthouse accessibility 95+ (100 on mobile and desktop, 2026-10-29); no layout shift (CLS 0 mobile, 0.01 desktop).
- [ ] Performance: desktop LCP 0.9s passes; mobile (simulated slow 4G, 4x CPU) LCP is 4–5s against the 2.5s target, TBT about 740ms, score 63–69.

---

## 16. Do's and don'ts

**Do:** stay monochrome, use big confident Oswald headlines with breathing room, keep the starfield visible, keep motion slow and eased, drive scenes by scroll progress, use tokens for every color.

**Don't:** add any accent color, use heavy shadows or tinted glassmorphism, add typefaces, crowd sections, hard-code `#fff`/`#000`, or colorize the wave or mountain art (the hero's hover reveal is the one deliberate exception to "all images are grayscale").

---

## 17. As built: departures and open gaps (audited after step 12, 2026-10-29)

Sections above are already edited in place; this is the one-stop list.

**Departures from the original spec (deliberate)**
- **Nav:** floating logo + burger drawer at every width instead of a top bar (5.2). Theme toggle is in the drawer footer.
- **Titles divider:** marquees keep moving on hover (7.3).
- **Laptop:** no dolly-in; stays open once opened; keyboard click closes it (7.4).
- **Wave transition:** timings fitted to Figma's stills, not the earlier prose (7.2.1).
- **Hero mask:** the cutout's alpha, not an SVG path (7.1).
- **Network sphere:** Canvas 2D, not three.js; stays complete once finished (7.5).
- **Achievements:** added `SEE MORE` filterable list (7.6).
- **Mountain:** built with 221 baked tiles; **being replaced by the dust effect and a redrawn art set** (7.7, batch step 15–16).
- **Contact:** Resend route decided and built (7.8).
- **Content files:** `stack.ts` instead of `tech.ts`; added `about.ts`, `contact.ts`, `about-dots.json`, `mountain-tiles.json`.
- **Laptop scene load:** deferred 4s after page load (performance, 13).
- **Breakpoints in use:** Tailwind `sm` 640, `md` 768, `lg` 1024, plus a custom 900 for the laptop. The spec's 1280 is not used.

**Mobile as built**
- Hero: under 640px a portrait composition (wordmark lower, cutout 150cqw wide, stage `100svh` with a 560px floor); outline-over-silhouette kept.
- Under 900px the laptop scene becomes a project card list.
- Under 768px the About wave pin is dropped; About content stacks (portrait above text, one-column grid).
- Experience accordion columns stack on narrow screens.
- Reduced motion verified static at 1440 and 390.

**Second batch (specified, not yet built):** see section 15, steps 13–19. New or changed in the spec: hero fit and crop (7.1), top-right arrow and About `01` removed, intro retimed to 3s (6), services section and eyebrow renumbering (5.3, 7.3.1), mountain redrawn with dust (7.7), mobile frames (12.1).

**Figma status (2026-10-29):** the Figma MCP call limit on the Starter plan was reached partway through this batch. Done in Figma: the redrawn mountain art on the template and the intro and light-intro stills, the tile frames deleted from states 02, 03 and 06, dust sprite layers added, and the experience eyebrow changed to `06`. **Still open in Figma:** the image fills on the art layers (`50:74`, `81:232`) and on the three dust layers came back empty and need re-applying; the services section and storyboard; the shorter intro board; the hero arrow and About `01` removals; the burger-drawer nav, the `SEE MORE` list and the laptop storyboard (stale before this batch); and all mobile frames. Until redrawn, this file wins over those frames.

**Spec items from section 12 not yet implemented (found in this audit; all are covered by section 12.1 and batch step 19)**
- ~~**Modals are not full-screen sheets on mobile.**~~ **Fixed (step 19):** under 640px the certificate and event modals are full-screen sheets (slide up, 44px close top-right, media on top, details scroll; event carousel 4:3 with swipe on the photo only and a scrolling thumbnail strip; tap the certificate to zoom it sideways). Between 640 and about 1000px the desktop 1120×680 layout still squeezes the details column. The list and network modals are unchanged.
- ~~**Marquee speed is the same on mobile**~~ **Fixed:** every marquee runs at 60% speed under 768px (`useMarquee`). Card and type sizes are not reduced yet.
- ~~**Mountain scene stays 200vh on mobile**~~ **Fixed in step 16:** 150vh under 768px.
- ~~**Theme toggle is not visible on mobile**~~ **Fixed:** a 44px sun/moon chip sits beside the burger under 768px; the drawer keeps its own.
- ~~**Network size on phones, tap-for-label, touch-drag**~~ **Verified/fixed:** about 340px at 390 wide (the radius follows the canvas width), horizontal drag spins and vertical scrolls the page, a tap on a logo shows its label until the next tap; the hint adds `TAP A LOGO` on touch screens.
- **Laptop on phones:** the spec's "one centered card with peeks, swipe to browse" was replaced by the card list.
- **Audited at 390×844 (dark and light):** no horizontal scroll anywhere; every visible link and button is at least 44px (logo, footer back-to-top, contact email and socials were raised on mobile; the footer stacks under 640px).
