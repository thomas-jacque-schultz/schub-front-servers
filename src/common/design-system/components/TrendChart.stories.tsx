import type { Meta, StoryObj } from "@storybook/react";
import { TrendChart } from "./TrendChart";

const meta = {
  title: "Données/TrendChart",
  component: TrendChart,
  args: {
    label: "Taux de victoire par mois",
    valueHeader: "Taux de victoire",
    emptyLabel: "Aucun mois à afficher",
    points: [
      { key: "1", label: "jan", value: 0.52, title: "52 % · 24 parties" },
      { key: "2", label: "fév", value: 0.48, title: "48 % · 31 parties" },
      { key: "3", label: "mar", value: 0.61, title: "61 % · 18 parties" },
      { key: "4", label: "avr", value: null, title: "aucune partie" },
      { key: "5", label: "mai", value: 0.44, title: "44 % · 27 parties" },
      { key: "6", label: "juin", value: 0.57, title: "57 % · 21 parties" },
    ],
    scaleMax: 1,
  },
} satisfies Meta<typeof TrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParMois: Story = {};

export const AvecRepere: Story = {
  args: {
    reference: 0.52,
    referenceLabel: "Trait : sa moyenne sur la période (52 %)",
  },
};

export const AvecTrous: Story = {
  args: {
    points: [
      { key: "1", label: "jan", value: null, title: "aucune partie" },
      { key: "2", label: "fév", value: null, title: "aucune partie" },
      { key: "3", label: "mar", value: 0.66, title: "66 % · 3 parties" },
    ],
  },
};

export const Vide: Story = { args: { points: [] } };
