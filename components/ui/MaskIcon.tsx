import type { CSSProperties } from "react";

/* Monochrome line icon from /public/assets/icons, painted with currentColor
   through a CSS mask, so it follows the theme token of whatever it sits in.
   (Figma's SVGs have white or black strokes baked in.) */
export function MaskIcon({
  name,
  width = 18,
  height = width,
  className = "",
}: {
  name: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`mask-icon ${className}`}
      style={{ "--icon": `url(/assets/icons/${name}.svg)`, width, height } as CSSProperties}
    />
  );
}
