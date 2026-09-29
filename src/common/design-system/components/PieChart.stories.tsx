import type { Meta, StoryObj } from "@storybook/react";
import { PieChart } from "./PieChart";

const meta = {
  title: "Données/PieChart",
  component: PieChart,
  args: {
    label: "Par mode de jeu",
    emptyLabel: "Aucune partie",
    otherLabel: "Autres modes",
    slices: [
      {
        key: "RANKED_SOLO",
        label: "Classée solo/duo",
        value: 48,
        detail: "52 % · 48 parties",
      },
      {
        key: "RANKED_FLEX",
        label: "Classée flexible",
        value: 22,
        detail: "45 % · 22 parties",
      },
      { key: "ARAM", label: "ARAM", value: 14, detail: "57 % · 14 parties" },
      {
        key: "NORMAL_DRAFT",
        label: "Normale draft",
        value: 6,
        detail: "50 % · 6 parties",
      },
    ],
  },
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const QuatreModes: Story = {};

export const PlusDeCinqModes: Story = {
  args: {
    slices: [
      {
        key: "a",
        label: "Classée solo/duo",
        value: 40,
        detail: "52 % · 40 parties",
      },
      {
        key: "b",
        label: "Classée flexible",
        value: 20,
        detail: "45 % · 20 parties",
      },
      { key: "c", label: "ARAM", value: 12, detail: "57 % · 12 parties" },
      {
        key: "d",
        label: "Normale draft",
        value: 6,
        detail: "50 % · 6 parties",
      },
      { key: "e", label: "Arène", value: 3, detail: "33 % · 3 parties" },
      { key: "f", label: "URF", value: 2, detail: "50 % · 2 parties" },
    ],
    otherDetail: (reste) => `${reste.reduce((s, p) => s + p.value, 0)} parties`,
  },
};

export const UnSeulMode: Story = {
  args: {
    slices: [
      {
        key: "a",
        label: "Classée solo/duo",
        value: 12,
        detail: "58 % · 12 parties",
      },
    ],
  },
};
