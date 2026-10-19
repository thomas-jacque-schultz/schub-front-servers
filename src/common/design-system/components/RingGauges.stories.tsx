import type { Meta, StoryObj } from "@storybook/react";
import { RingGauges } from "./RingGauges";

const meta = {
  title: "Données/RingGauges",
  component: RingGauges,
  args: {
    label: "Part des parties d'équipe où chacun était là",
    items: [
      {
        key: "a",
        label: "Joueur A",
        value: 1,
        valueLabel: "100 %",
        detail: "60 parties · 48 %",
      },
      {
        key: "b",
        label: "Joueur B",
        value: 0.77,
        valueLabel: "77 %",
        detail: "46 parties · 48 %",
      },
      {
        key: "c",
        label: "Joueur C",
        value: 0.63,
        valueLabel: "63 %",
        detail: "38 parties · 63 %",
      },
      {
        key: "d",
        label: "Joueur D",
        value: 0.47,
        valueLabel: "47 %",
        detail: "28 parties · 21 %",
      },
      { key: "e", label: "Joueur E", value: null, valueLabel: "—" },
    ],
  },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
} satisfies Meta<typeof RingGauges>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Presence: Story = {};
