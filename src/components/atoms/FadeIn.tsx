"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap-client";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function FadeIn({ children, className, delay = 0, y = 18 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          delay,
          ease: "power3.out",
          // First paint already matches the "from" state (inline style below).
          immediateRender: false,
        },
      );
    },
    { scope: ref, dependencies: [delay, y] },
  );

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ opacity: 0, transform: `translateY(${y}px)` }}
    >
      {children}
    </div>
  );
}
