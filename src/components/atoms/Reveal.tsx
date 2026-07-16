"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap-client";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** When true, also fades opacity 0 → 1 (matches original Framer Motion Reveal). */
  fade?: boolean;
};

/**
 * Scroll-in reveal: y: 28 → 0.
 * duration 0.65, ease [0.22, 1, 0.36, 1], viewport once + margin -60px
 */
export function Reveal({ children, className, delay = 0, fade = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.fromTo(
        el,
        { y: 28, ...(fade ? { opacity: 0 } : {}) },
        {
          y: 0,
          ...(fade ? { opacity: 1 } : {}),
          duration: 0.65,
          delay,
          ease: "reveal",
          immediateRender: true,
          scrollTrigger: {
            trigger: el,
            // Framer Motion viewport={{ once: true, margin: "-60px" }}
            start: "top bottom-=60",
            once: true,
          },
        },
      );
    },
    { dependencies: [delay, fade], scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        transform: "translateY(28px)",
        ...(fade ? { opacity: 0 } : {}),
      }}
    >
      {children}
    </div>
  );
}
