import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Expandable } from "./Expandable";
import { Text } from "./Text";

const meta = {
  title: "Primitives/Expandable",
  component: Expandable,
  args: {
    summary: <Text>Victoire · 32:14 · Classée solo</Text>,
    open: false,
    onToggle: () => undefined,
    children: (
      <Text tone="secondary">Le détail, monté seulement une fois ouvert.</Text>
    ),
  },
} satisfies Meta<typeof Expandable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactif: Story = {
  render: (args) => {
    const [ouvert, setOuvert] = useState(false);
    return <Expandable {...args} open={ouvert} onToggle={setOuvert} />;
  },
};

export const Ouvert: Story = { args: { open: true } };
