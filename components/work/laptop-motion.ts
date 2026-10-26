/* Shared between WorkScene (scroll, carousel) and LaptopScene (the 3D model). */
export type SceneState = { p: number }; // scroll progress through the pinned scene, 0 to 1

export const LID_END = 0.35; // the lid is fully open by this progress
export const LID_OPEN = 11.7; // degrees past upright: it leans back a little
export const CLOSED_DROP = -313; // Figma px: the closed laptop sits this far above its open position
export const TILT = 9; // camera elevation, degrees
