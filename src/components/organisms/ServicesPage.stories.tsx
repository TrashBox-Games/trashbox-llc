import type { Meta, StoryObj } from "@storybook/react";
import { ServicesPage } from "./ServicesPage";

const meta = {
  title: "Organisms/ServicesPage",
  component: ServicesPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ServicesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
