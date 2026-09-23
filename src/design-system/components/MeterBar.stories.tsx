import type { Meta, StoryObj } from "@storybook/react";
import { MeterBar } from "./MeterBar";

const meta = {
  title: "Données/MeterBar",
  component: MeterBar,
  args: { label: "Taux de victoire", value: 0.54, valueLabel: "54 %" },
} satisfies Meta<typeof MeterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export const AvecAppui: Story = {
  args: { hint: "69 victoires sur 128 parties" },
};

export const SansValeur: Story = {
  args: { value: null, valueLabel: "—", hint: "aucune partie sur la période" },
};

export const Plein: Story = {
  args: { value: 1, valueLabel: "100 %", hint: "sur 2 parties" },
};
