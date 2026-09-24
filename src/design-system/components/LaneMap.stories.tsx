import type { Meta, StoryObj } from "@storybook/react";
import { LaneMap } from "./LaneMap";

const meta = {
  title: "Données/LaneMap",
  component: LaneMap,
  args: {
    label: "Notre jungler, de 2 à 14 min",
    highlight: "BOT",
    zones: [
      { key: "TOP", label: "Haut", value: 4, valueLabel: "4 min" },
      { key: "MID", label: "Milieu", value: 1, valueLabel: "1 min" },
      { key: "BOT", label: "Bas", value: 8, valueLabel: "8 min" },
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 220 }}>{Story()}</div>],
} satisfies Meta<typeof LaneMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoteFort: Story = {};

export const Equilibre: Story = {
  args: {
    highlight: null,
    zones: [
      { key: "TOP", label: "Haut", value: 5, valueLabel: "5 min" },
      { key: "MID", label: "Milieu", value: 3, valueLabel: "3 min" },
      { key: "BOT", label: "Bas", value: 5, valueLabel: "5 min" },
    ],
  },
};
