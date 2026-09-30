import type { Meta, StoryObj } from "@storybook/react";
import { QuadStatTile } from "./QuadStatTile";

const meta = {
  title: "Données/QuadStatTile",
  component: QuadStatTile,
  args: {
    label: "Victoires",
    main: { value: "45 %", hint: "Sur les parties jouées ensemble" },
    topRight: {
      value: "−5 pts",
      tone: "negative",
      hint: "Écart avec la moyenne des coéquipiers",
    },
    bottomLeft: {
      value: "+3 pts",
      tone: "positive",
      hint: "Écart avec ses propres stats, toutes parties",
    },
    bottomRight: { value: "4e", hint: "Rang parmi les membres" },
  },
} satisfies Meta<typeof QuadStatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ecarts: Story = {};

export const SansPartieEnsemble: Story = {
  args: {
    label: "KDA",
    main: { value: "—", hint: "Aucune partie d'équipe sur la période" },
    topRight: { value: "—", hint: "Écart avec la moyenne des coéquipiers" },
    bottomLeft: {
      value: "—",
      hint: "Écart avec ses propres stats, toutes parties",
    },
    bottomRight: { value: "—", hint: "Rang parmi les membres" },
  },
};
