import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";
import { Stack } from "./Stack";
import { Text } from "./Text";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  args: { name: "capitaine.nemo", size: "medium" },
  argTypes: { size: { control: "inline-radio", options: ["small", "medium"] } },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SansImage: Story = {};

export const Petit: Story = { args: { size: "small" } };

export const AcoteDunNom: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1.5} align="center">
      <Avatar {...args} />
      <Text>{args.name}</Text>
    </Stack>
  ),
};
