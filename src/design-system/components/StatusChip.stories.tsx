import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { StatusChip } from "./StatusChip";

const meta = {
  title: "Primitives/StatusChip",
  component: StatusChip,
  args: { status: "online", size: "medium" },
  argTypes: {
    status: { control: "inline-radio", options: ["online", "offline", "unknown", "unreachable"] },
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnLigne: Story = { args: { status: "online" } };
export const HorsLigne: Story = { args: { status: "offline" } };
export const Inconnu: Story = { args: { status: "unknown" } };
export const Inaccessible: Story = { args: { status: "unreachable" } };

export const LesQuatreStatuts: Story = {
  render: () => (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      <StatusChip status="online" />
      <StatusChip status="offline" />
      <StatusChip status="unknown" />
      <StatusChip status="unreachable" />
    </Stack>
  ),
};

export const TaillePetite: Story = {
  render: () => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <StatusChip size="small" status="online" />
      <StatusChip size="small" status="offline" />
      <StatusChip size="small" status="unknown" />
      <StatusChip size="small" status="unreachable" />
    </Stack>
  ),
};
