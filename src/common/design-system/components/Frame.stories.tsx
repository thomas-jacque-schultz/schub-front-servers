import type { Meta, StoryObj } from "@storybook/react";
import { Frame } from "./Frame";
import { Text } from "./Text";

const meta = {
  title: "Structure/Frame",
  component: Frame,
  args: { children: <Text>Contenu encadré</Text> },
} satisfies Meta<typeof Frame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};
export const Accent: Story = { args: { accent: true } };
export const Dense: Story = { args: { dense: true } };
