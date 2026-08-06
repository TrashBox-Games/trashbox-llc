"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap-client";

type TiltMediaProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees on each axis. */
  maxTilt?: number;
  /** When false, skips the media frame chrome for text/content blocks. */
  framed?: boolean;
};

export function TiltMedia({
  children,
  className,
  maxTilt = 9,
  framed = true,
}: TiltMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const resetTilt = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;
    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
    });
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reducedMotionRef.current) return;
      const root = rootRef.current;
      const el = tiltRef.current;
      if (!root || !el) return;

      const rect = root.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * maxTilt * 2;
      const rotateX = (0.5 - y) * maxTilt * 2;

      gsap.to(el, {
        rotateX,
        rotateY,
        scale: 1.03,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
    [maxTilt],
  );

  return (
    <div
      ref={rootRef}
      data-testid="tilt-media"
      className={cn(
        "overflow-visible [perspective:1100px]",
        className,
      )}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <div
        ref={tiltRef}
        className={cn(
          "relative h-full w-full will-change-transform [transform-style:preserve-3d]",
          framed && "overflow-hidden rounded-xl bg-surface-container-low",
        )}
      >
        {children}
      </div>
    </div>
  );
}
