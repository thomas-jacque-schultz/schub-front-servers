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

export const AuDessusEtEnDessousDeLaMoyenne: Story = {
  args: {
    label: "Taux de victoire selon le côté fort de notre jungler",
    highlight: "TOP",
    zones: [
      {
        key: "TOP",
        label: "Haut",
        value: 14,
        valueLabel: "64 % · 14",
        tone: "positive",
        strength: 0.8,
      },
      {
        key: "MID",
        label: "Équilibré",
        value: 9,
        valueLabel: "50 % · 9",
        tone: "neutral",
      },
      {
        key: "BOT",
        label: "Bas",
        value: 2,
        valueLabel: "— · 2",
        tone: "empty",
      },
    ],
  },
};
