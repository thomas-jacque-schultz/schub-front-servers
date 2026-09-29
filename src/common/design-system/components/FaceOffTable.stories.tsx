import type { Meta, StoryObj } from "@storybook/react";
import { FaceOffTable } from "./FaceOffTable";

const meta = {
  title: "Données/FaceOffTable",
  component: FaceOffTable,
  args: {
    title: "Objectifs avant 15 min",
    oursLabel: "Nous",
    theirsLabel: "Eux",
    rows: [
      { key: "dragons", label: "Dragons", ours: 2, theirs: 1 },
      { key: "grubs", label: "Larves", ours: 3, theirs: 3 },
      { key: "heralds", label: "Héraut", ours: 0, theirs: 1 },
    ],
  },
} satisfies Meta<typeof FaceOffTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DebutDePartie: Story = {};
