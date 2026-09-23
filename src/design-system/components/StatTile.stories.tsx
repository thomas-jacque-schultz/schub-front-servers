import type { Meta, StoryObj } from "@storybook/react";
import { StatTile } from "./StatTile";

const meta = {
  title: "Données/StatTile",
  component: StatTile,
  args: {
    label: "Taux de victoire",
    value: "54 %",
    hint: "sur 128 parties · 4 derniers mois",
  },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export const AvecEcart: Story = {
  args: {
    delta: "+13 pts",
    deltaTone: "positive",
    deltaHint: "contre le reste de son pool",
  },
};

export const EcartNegatif: Story = {
  args: {
    value: "41 %",
    delta: "−9 pts",
    deltaTone: "negative",
    deltaHint: "contre ses coéquipiers",
  },
};

export const AssiseFaible: Story = {
  args: { value: "67 %", hint: "sur 3 parties" },
};
