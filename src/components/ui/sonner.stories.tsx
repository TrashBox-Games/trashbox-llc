import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        onClick={() => toast.success("Invite sent to teammate@company.com.")}
      >
        Success
      </Button>
      <Button
        type="button"
        variant="outline"
        className="font-headline text-xs font-bold uppercase tracking-widest"
        onClick={() => toast.message("Profile updated.")}
      >
        Default
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => toast.info("Mailbox sync is still running.")}
      >
        Info
      </Button>
      <Button
        type="button"
        variant="outline"
        className="font-headline text-xs font-bold uppercase tracking-widest"
        onClick={() => toast.warning("Team is at the seat limit.")}
      >
        Warning
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={() => toast.error("Failed to send invite")}
      >
        Error
      </Button>
    </div>
  );
}

const meta = {
  title: "UI/Toast",
  component: ToastDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-background min-h-48 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Success: Story = {
  play: async () => {
    toast.success("Invite sent to ezekielbleh@gmail.com.");
  },
};

export const Error: Story = {
  play: async () => {
    toast.error("Failed to send invite");
  },
};

export const Info: Story = {
  play: async () => {
    toast.info("Mailbox sync is still running.");
  },
};

export const Warning: Story = {
  play: async () => {
    toast.warning("Team is at the seat limit.");
  },
};
