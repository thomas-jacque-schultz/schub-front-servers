import type { Meta, StoryObj } from "@storybook/react";
import { RadarChart } from "./RadarChart";

const axes = [
  { key: "dpm", label: "DPM" },
  { key: "gpm", label: "Or/min" },
  { key: "dtpm", label: "Subis/min" },
  { key: "kda", label: "KDA" },
  { key: "vision", label: "Vision" },
  { key: "winRate", label: "Victoires" },
  { key: "rank", label: "Rang" },
];

const meta = {
  title: "Données/RadarChart",
  component: RadarChart,
  args: {
    label: "Profil du joueur",
    axes,
    emptyLabel: "Pas encore de données",
    scaleNote: "Centre : 5e percentile des joueurs croisés · bord : 95e",
    series: [
      {
        key: "recent",
        label: "Patchs 16.18 – 16.17",
        emphasis: "primary",
        values: [0.72, 0.55, 0.4, 0.61, 0.35, 0.58, 0.5],
        display: ["820", "402", "690", "3,1", "1,2", "56 %", "Émeraude II"],
      },
      {
        key: "previous",
        label: "Patchs 16.16 – 16.15",
        emphasis: "secondary",
        values: [0.6, 0.5, 0.45, 0.5, 0.3, 0.44, 0.5],
        display: ["760", "390", "712", "2,7", "1,1", "49 %", "Émeraude II"],
      },
    ],
  },
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeuxPeriodes: Story = {};

export const AxeSansDonnee: Story = {
  args: {
    series: [
      {
        key: "recent",
        label: "Patchs 16.18 – 16.17",
        emphasis: "primary",
        values: [0.72, 0.55, 0.4, 0.61, 0.35, 0.58, null],
        display: ["820", "402", "690", "3,1", "1,2", "56 %", "—"],
      },
    ],
  },
};

export const Vide: Story = { args: { series: [] } };
