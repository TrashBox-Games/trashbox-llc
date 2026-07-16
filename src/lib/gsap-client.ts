"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // Matches Framer Motion ease: [0.22, 1, 0.36, 1]
  CustomEase.create("reveal", "0.22, 1, 0.36, 1");
}

export { gsap, ScrollTrigger };
