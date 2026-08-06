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

export const UnframedText: Story = {
  args: {
    framed: false,
    className: "w-[28rem]",
    children: (
      <div className="space-y-4 text-white">
        <p className="text-xs tracking-[0.3em] text-white/40 uppercase">Founder</p>
        <h2 className="text-4xl font-bold tracking-tight">Ezekiel Mohr</h2>
        <p className="text-white/70">
          Pointer-follow tilt without the media frame chrome.
        </p>
      </div>
    ),
  },
};
