import type { Meta, StoryObj } from "@storybook/react";
import { SplitBar } from "./SplitBar";

const meta = {
  title: "Données/SplitBar",
  component: SplitBar,
} satisfies Meta<typeof SplitBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoteFort: Story = {
  args: {
    label: "Présence du jungler, 2 à 14 min",
    highlight: "top",
    segments: [
      { key: "top", label: "Haut", value: 9, valueLabel: "9 min" },
      { key: "mid", label: "Milieu", value: 1, valueLabel: "1 min" },
      { key: "bot", label: "Bas", value: 3, valueLabel: "3 min" },
    ],
  },
};

export const Equilibre: Story = {
  args: {
    label: "Présence du jungler, 2 à 14 min",
    segments: [
      { key: "top", label: "Haut", value: 6 },
      { key: "mid", label: "Milieu", value: 1 },
      { key: "bot", label: "Bas", value: 6 },
    ],
  },
};
