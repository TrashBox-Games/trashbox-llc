import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-background p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="text-white">Ada Lovelace</TableCell>
          <TableCell>Owner</TableCell>
          <TableCell className="text-right text-white/60">—</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="text-white">Sarah Chen</TableCell>
          <TableCell>Member</TableCell>
          <TableCell className="text-right text-white/60">Edit</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
