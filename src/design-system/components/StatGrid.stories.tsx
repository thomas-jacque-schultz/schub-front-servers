import type { Meta, StoryObj } from "@storybook/react";
import { StatGrid } from "./StatGrid";

const meta = {
  title: "Données/StatGrid",
  component: StatGrid,
  args: {
    items: [
      { key: "kda", label: "KDA", value: "3,1", hint: "6,2 / 3,4 / 4,4" },
      { key: "cs", label: "CS/min", value: "7,4" },
      { key: "gold", label: "Or/min", value: "412", delta: "+18", deltaTone: "positive", deltaHint: "vs coéquipiers" },
      { key: "dpm", label: "DPM", value: "784" },
      { key: "dtpm", label: "Subis/min", value: "690" },
      { key: "vision", label: "Vision/min", value: "1,1", delta: "−0,3", deltaTone: "negative" },
    ],
  },
} satisfies Meta<typeof StatGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rangee: Story = {};

export const Compacte: Story = { args: { size: "small", minWidth: 80, divided: true } };
