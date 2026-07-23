import type { Meta, StoryObj } from "@storybook/react";
import { useLayoutEffect, type ReactNode } from "react";
import { EmailRedirect } from "./EmailRedirect";

function StubLocationReplace({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    const original = Location.prototype.replace;
    Location.prototype.replace = function replace() {
      /* Keep Storybook from navigating away. */
    };
    return () => {
      Location.prototype.replace = original;
    };
  }, []);

  return children;
}

const meta = {
  title: "Features/Email/EmailRedirect",
  component: EmailRedirect,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <StubLocationReplace>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </StubLocationReplace>
    ),
  ],
} satisfies Meta<typeof EmailRedirect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fallback UI only — navigation is stubbed so Storybook stays put. */
export const Default: Story = {};
