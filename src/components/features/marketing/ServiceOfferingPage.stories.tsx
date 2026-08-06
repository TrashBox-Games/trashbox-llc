import type { Meta, StoryObj } from "@storybook/react";
import { ServiceOfferingPage } from "./ServiceOfferingPage";
import { SERVICE_OFFERINGS } from "./service-offerings";

const meta = {
  title: "Features/Marketing/ServiceOfferingPage",
  component: ServiceOfferingPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ServiceOfferingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Websites: Story = {
  args: { offering: SERVICE_OFFERINGS[0] },
};

export const WebApplications: Story = {
  args: { offering: SERVICE_OFFERINGS[1] },
};

export const Systems: Story = {
  args: { offering: SERVICE_OFFERINGS[2] },
};

export const MobileApps: Story = {
  args: { offering: SERVICE_OFFERINGS[3] },
};

export const AIIntegration: Story = {
  args: { offering: SERVICE_OFFERINGS[4] },
};
