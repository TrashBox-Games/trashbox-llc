"use client";

import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

const toasterStyle = {
  "--normal-bg": "var(--color-surface-container-low)",
  "--normal-text": "var(--color-on-surface)",
  "--normal-border": "var(--color-outline-variant)",
  "--border-radius": "var(--radius-sm)",
  /* Success — dark green, no design-token yet */
  "--success-bg": "hsl(150 40% 10%)",
  "--success-border": "hsl(150 45% 22%)",
  "--success-text": "hsl(145 60% 72%)",
  /* Info — cool neutral blue */
  "--info-bg": "hsl(215 35% 12%)",
  "--info-border": "hsl(215 30% 24%)",
  "--info-text": "hsl(210 70% 75%)",
  /* Warning — warm amber */
  "--warning-bg": "hsl(40 45% 10%)",
  "--warning-border": "hsl(40 50% 22%)",
  "--warning-text": "hsl(42 80% 70%)",
  /* Error — design tokens */
  "--error-bg": "var(--color-error-container)",
  "--error-border": "hsl(0 70% 28%)",
  "--error-text": "var(--color-on-error-container)",
} as CSSProperties;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      richColors
      duration={3500}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "font-body text-sm shadow-lg",
          title: "font-body text-sm",
          description: "text-sm opacity-90",
        },
      }}
      style={toasterStyle}
      {...props}
    />
  );
}

export { Toaster, toast };
