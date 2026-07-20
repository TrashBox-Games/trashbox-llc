import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "./CodeBlock";

const meta = {
  title: "Molecules/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: "const x = 1;",
  },
};

export const WithLanguage: Story = {
  args: {
    language: "bash",
    code: `curl -X POST "$API_BASE/v1/submissions" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"senderName":"Ada","senderEmail":"ada@example.com","message":"Hello"}'`,
  },
};

export const Json: Story = {
  args: {
    language: "json",
    code: `{
  "senderName": "Ada Lovelace",
  "senderEmail": "ada@example.com",
  "message": "Need a quote for a new site"
}`,
  },
};
