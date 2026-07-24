import type { Preview } from "@storybook/react";
import "@/styles/globals.css";

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
      <div className="bg-background text-on-background font-body antialiased">
        <Story />
      </div>
    ),
  ],
};

export default preview;
