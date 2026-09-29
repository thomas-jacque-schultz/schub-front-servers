import type { Meta, StoryObj } from "@storybook/react";
import { ClockChart, type ClockSector } from "./ClockChart";

const plages: [number, number, ClockSector["tone"]][] = [
  [0, 6, "negative"],
  [2, 1, "empty"],
  [4, 0, "empty"],
  [6, 0, "empty"],
  [8, 0, "empty"],
  [10, 2, "empty"],
  [12, 5, "neutral"],
  [14, 7, "neutral"],
  [16, 9, "positive"],
  [18, 12, "neutral"],
  [20, 20, "positive"],
  [22, 14, "negative"],
];

const meta = {
  title: "Données/ClockChart",
  component: ClockChart,
  args: {
    label: "Taux de victoire selon l'heure",
    emptyLabel: "Aucune partie",
    center: "Tu gagnes 58 % de 20 h à 22 h, 41 % de 0 h à 2 h",
    sectors: plages.map(([debut, parties, tone]) => ({
      key: String(debut),
      startHour: debut,
      endHour: debut + 2,
      weight: parties,
      tone,
      title: `${debut} h – ${debut + 2} h · ${parties} parties`,
    })),
  },
} satisfies Meta<typeof ClockChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SoirEtNuit: Story = {};
