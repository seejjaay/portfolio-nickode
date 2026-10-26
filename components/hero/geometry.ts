/* Hero stage geometry (DESIGN.md 7.1). The desktop composition is Figma's 1440x900
   frame (nodes 3:24 / 59:712), expressed in container-width units so every layer
   scales with the stage and stays locked together at any viewport size. The values
   live in CSS variables on .hero-stage (globals.css), which swaps in a portrait
   composition on phones; the layers read them through these styles, so the solid
   wordmark, the portrait and the outline wordmark always agree.

   Desktop (1440 frame, px): wordmark left 50, top 301, font 24.8cqw; photo box
   left 18, top 222, 1044x765 (the cutout WebPs are cropped to exactly this box). */
export const portraitBoxStyle = {
  left: "var(--pt-left)",
  top: "var(--pt-top)",
  width: "var(--pt-w)",
  height: "var(--pt-h)",
} as const;

export const wordmarkBoxStyle = { left: "var(--wm-left)", top: "var(--wm-top)", fontSize: "var(--wm-size)" } as const;

// The outline wordmark sits inside the photo box, so its offset is the difference.
export const wordmarkInPortraitStyle = {
  left: "calc(var(--wm-left) - var(--pt-left))",
  top: "calc(var(--wm-top) - var(--pt-top))",
  fontSize: "var(--wm-size)",
} as const;
