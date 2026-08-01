import type { Meta, StoryObj } from "@storybook/react";
import { StubAuthProvider } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

const meta = {
  title: "Features/Portal/Auth/LoginForm",
  component: LoginForm,
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
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
