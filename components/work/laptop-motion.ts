/* Shared between WorkScene (scroll, carousel) and LaptopScene (the 3D model). */
/* p: scroll progress through the pinned scene, 0 to 1. lid: how open the laptop is,
   0 closed to 1 open, smoothed and owned by WorkScene (it latches open and can be
   closed by clicking the keyboard). click: the 3D model reports clicks here. */
export type SceneState = {
  p: number;
  lid: number;
  click?: (part: "base" | "lid") => void;
};

export const LID_END = 0.35; // the lid is fully open by this progress
export const LID_OPEN = 11.7; // degrees past upright: it leans back a little
export const CLOSED_DROP = -313; // Figma px: the closed laptop sits this far above its open position
export const TILT = 9; // camera elevation, degrees
