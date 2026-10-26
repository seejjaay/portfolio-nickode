"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { startSmoothScroll } from "@/lib/scroll";

export function ScrollProvider() {
  useEffect(() => startSmoothScroll(), []);
  return null;
}
