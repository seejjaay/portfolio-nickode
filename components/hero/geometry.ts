/* Hero stage geometry, in Figma's 1440x900 pixels (nodes 3:24 / 59:712).
   cq() converts a 1440-frame pixel value to cqw, so every layer scales with
   the stage width and stays locked together at any viewport size. */
export const cq = (px: number) => `${((px / 1440) * 100).toFixed(4)}cqw`;

export const WORDMARK = { left: 50, top: 301, fontSize: "24.8cqw" } as const;

/* The grayscale photo box. The cutout WebPs are cropped to exactly this
   framing, so the whole box is the image. */
export const PORTRAIT = { left: 18, top: 222, width: 1044, height: 765 } as const;

export const portraitBoxStyle = {
  left: cq(PORTRAIT.left),
  top: cq(PORTRAIT.top),
  width: cq(PORTRAIT.width),
  height: cq(PORTRAIT.height),
} as const;

export const wordmarkStyle = { fontSize: WORDMARK.fontSize } as const;
