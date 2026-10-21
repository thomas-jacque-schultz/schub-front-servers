import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { SideLayout } from "./SideLayout";
import { Text } from "./Text";

const meta = {
  title: "Structure/SideLayout",
  component: SideLayout,
  args: {
    children: (
      <Card title="Manche 3/10">
        <Text>Le contenu principal du jeu.</Text>
      </Card>
    ),
    side: (
      <Card title="Scores">
        <Text>Joueuse 1 · 120 pts</Text>
      </Card>
    ),
  },
} satisfies Meta<typeof SideLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};
export const Etroite: Story = { args: { sideWidth: 180 } };
