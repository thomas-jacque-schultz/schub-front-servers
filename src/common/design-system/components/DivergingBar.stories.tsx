import type { Meta, StoryObj } from "@storybook/react";
import { DivergingBar } from "./DivergingBar";
import { Stack } from "./Stack";

const meta = {
  title: "Données/DivergingBar",
  component: DivergingBar,
  args: {
    label: "Écart d'or à 15 min",
    value: -1080,
    max: 2000,
    valueLabel: "-1 080",
    centerLabel: "moyenne du palier",
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}>{Story()}</div>],
} satisfies Meta<typeof DivergingBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EnRetard: Story = {};

export const EnAvance: Story = {
  args: {
    label: "Écart de CS à 15 min",
    value: 12,
    max: 20,
    valueLabel: "+12",
  },
};

export const Empilees: Story = {
  render: () => (
    <Stack spacing={0.5}>
      <DivergingBar
        label="Or à 15 min"
        value={-1080}
        max={2000}
        valueLabel="-1 080"
      />
      <DivergingBar label="CS à 15 min" value={8} max={20} valueLabel="+8" />
      <DivergingBar
        label="XP à 15 min"
        value={-120}
        max={1000}
        valueLabel="-120"
      />
    </Stack>
  ),
};
