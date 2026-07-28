import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider delayDuration={0}>
        <div className="bg-background flex justify-center p-16">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Tooltip details</TooltipContent>
    </Tooltip>
  ),
};

export const MessageMeta: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Details">
          i
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="left"
        className="bg-surface-container-highest text-on-surface border-outline-variant/20 max-w-xs border px-3 py-2"
      >
        <dl className="space-y-1.5 text-left">
          <div className="flex gap-3">
            <dt className="font-label text-outline w-10 shrink-0 text-[10px] uppercase">
              From
            </dt>
            <dd className="text-xs">sales@example.com</dd>
          </div>
          <div className="flex gap-3">
            <dt className="font-label text-outline w-10 shrink-0 text-[10px] uppercase">
              To
            </dt>
            <dd className="text-xs">ada@example.com</dd>
          </div>
          <div className="flex gap-3">
            <dt className="font-label text-outline w-10 shrink-0 text-[10px] uppercase">
              Date
            </dt>
            <dd className="text-xs">Jul 15, 2026, 1:00 PM</dd>
          </div>
        </dl>
      </TooltipContent>
    </Tooltip>
  ),
};
