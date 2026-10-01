import type { Meta, StoryObj } from "@storybook/react";
import { PremadeLabMark } from "./PremadeLabMark";
import { Stack } from "./Stack";

const meta = {
  title: "Primitives/PremadeLabMark",
  component: PremadeLabMark,
  args: { size: 28 },
} satisfies Meta<typeof PremadeLabMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DansLeBandeau: Story = {};

export const Tailles: Story = {
  render: () => (
    <Stack direction="row" spacing={3} align="end">
      <PremadeLabMark size={16} />
      <PremadeLabMark size={28} />
      <PremadeLabMark size={64} />
      <PremadeLabMark size={160} />
    </Stack>
  ),
};
