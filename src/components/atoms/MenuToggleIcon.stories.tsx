import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MenuToggleIcon } from "./MenuToggleIcon";

const meta = {
  title: "Atoms/MenuToggleIcon",
  component: MenuToggleIcon,
  tags: ["autodocs"],
  args: {
    open: false,
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MenuToggleIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    open: false,
  },
};

export const Open: Story = {
  args: {
    open: true,
  },
};

export const Interactive: Story = {
  render: function InteractiveMenuToggle() {
    const [open, setOpen] = useState(false);
    return (
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center text-white"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <MenuToggleIcon open={open} />
      </button>
    );
  },
};
