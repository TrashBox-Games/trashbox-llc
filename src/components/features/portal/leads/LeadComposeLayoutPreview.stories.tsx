import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { LeadComposeLayoutPreview } from "./LeadComposeLayoutPreview";

const meta = {
  title: "Features/Portal/Leads/LeadComposeLayoutPreview",
  component: LeadComposeLayoutPreview,
  tags: ["autodocs"],
  args: {
    onEdit: fn(),
    onRemove: fn(),
    html: `<div style="padding:24px;font-family:sans-serif;background:#0f766e;color:white;">
      <h1 style="margin:0 0 12px;font-size:28px;">Make your trip here</h1>
      <p style="margin:0;opacity:0.9;">A sample layout preview for compose.</p>
    </div>`,
    signatureHtml: "<p>Thanks,<br />Sales Team</p>",
  },
} satisfies Meta<typeof LeadComposeLayoutPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSignature: Story = {
  args: {
    signatureHtml: "",
  },
};
