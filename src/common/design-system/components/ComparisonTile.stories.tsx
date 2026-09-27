import type { Meta, StoryObj } from "@storybook/react";
import { ComparisonTile } from "./ComparisonTile";

const emblem = (
  <span
    aria-label="Or"
    style={{ width: 20, height: 15, borderRadius: 3, background: "#c8aa6e" }}
  />
);

const meta = {
  title: "Données/ComparisonTile",
  component: ComparisonTile,
  args: {
    title: "CS par minute",
    entries: [
      { label: "Partie", value: "7,8", tone: "positive" },
      { label: "Ma moyenne", value: "6,9" },
      { label: "Rang", value: <>{emblem} Or</> },
    ],
  },
} satisfies Meta<typeof ComparisonTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MieuxQueDHabitude: Story = {};

export const MoinsBien: Story = {
  args: {
    title: "Morts pour 10 min",
    entries: [
      { label: "Partie", value: "3,1", tone: "negative" },
      { label: "Ma moyenne", value: "2,2" },
      { label: "Rang", value: "—" },
    ],
  },
};
