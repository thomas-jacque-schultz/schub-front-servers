import type { Meta, StoryObj } from "@storybook/react";
import { Histogram } from "./Histogram";

const COMPTES = [3, 9, 16, 19, 17, 13, 9, 6, 4, 2, 1, 1, 0.5, 0.3, 0.2];

const meta = {
  title: "Données/Histogram",
  component: Histogram,
  args: {
    ariaLabel: "Morts par partie",
    bars: COMPTES.map((compte, index) => ({
      label: index === COMPTES.length - 1 ? `${index}+` : String(index),
      value: compte,
      tooltip: `${index} morts : ${compte} % des parties`,
    })),
  },
} satisfies Meta<typeof Histogram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SansRepere: Story = {};

export const AvecRepere: Story = {
  args: { markerAt: 6.6, markerLabel: "toi : 6,1" },
};

export const RepereADroite: Story = {
  args: { markerAt: 12.4, markerLabel: "toi : 11,9" },
};
