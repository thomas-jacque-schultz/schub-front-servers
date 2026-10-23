import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { PageContainer } from "./PageContainer";
import { Text } from "./Text";

const meta = {
  title: "Structure/PageContainer",
  component: PageContainer,
  args: {
    children: (
      <Card title="Ton pseudo pour ce salon">
        <Text>Un formulaire seul, centré.</Text>
      </Card>
    ),
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {};
export const Etroit: Story = { args: { width: "sm" } };
