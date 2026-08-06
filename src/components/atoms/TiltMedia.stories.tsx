import type { Meta, StoryObj } from "@storybook/react";
import Image from "next/image";
import { TiltMedia } from "./TiltMedia";

const meta = {
  title: "Atoms/TiltMedia",
  component: TiltMedia,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof TiltMedia>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "relative w-[28rem] aspect-[16/11]",
    children: (
      <Image
        src="/images/service-websites.png"
        alt="Website preview"
        fill
        className="object-cover"
        sizes="28rem"
      />
    ),
  },
};
