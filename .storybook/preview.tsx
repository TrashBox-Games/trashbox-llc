import type { Preview } from "@storybook/react";
import { useLayoutEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

/**
 * Chromatic captures die if a story calls location.assign/replace.
 * Stub both for the whole Storybook iframe (production app is unaffected).
 */
function DisableHardNavigation({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const assign = Location.prototype.assign;
    const replace = Location.prototype.replace;
    Location.prototype.assign = function assignStub() {
      /* Storybook/Chromatic: stay on the story. */
    };
    Location.prototype.replace = function replaceStub() {
      /* Storybook/Chromatic: stay on the story. */
    };
    return () => {
      Location.prototype.assign = assign;
      Location.prototype.replace = replace;
    };
  }, []);

  return children;
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#131313" },
        { name: "surface", value: "#201f1f" },
        { name: "light", value: "#ffffff" },
      ],
    },
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <DisableHardNavigation>
        <div className="bg-background text-on-background font-body antialiased">
          <Story />
          <Toaster />
        </div>
      </DisableHardNavigation>
    ),
  ],
};

export default preview;
