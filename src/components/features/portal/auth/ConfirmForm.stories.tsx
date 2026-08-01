import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { ConfirmForm } from "./ConfirmForm";

const meta = {
  title: "Features/Portal/Auth/ConfirmForm",
  component: ConfirmForm,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <StubAuthProvider value={{ status: "signedOut", configured: true }}>
        <div className="mx-auto max-w-screen-2xl px-8 pt-16 pb-24">
          <Story />
        </div>
      </StubAuthProvider>
    ),
  ],
} satisfies Meta<typeof ConfirmForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
