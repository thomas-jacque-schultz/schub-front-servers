import type { Meta, StoryObj } from "@storybook/react";
import { BreakdownTable } from "./BreakdownTable";

const ligne = (
  key: string,
  label: string,
  valeurs: number[],
  split: [number, number],
  highlight = false,
) => ({
  key,
  label,
  caption: "4/3/6",
  highlight,
  values: {
    sbires: valeurs[0],
    jungle: valeurs[1],
    plaques: valeurs[2],
    tours: valeurs[3],
    kills: valeurs[4],
  },
  total: 500 + valeurs.reduce((a, b) => a + b, 0),
  split,
  splitCaption: `${split[0] + split[1]} · 3 morts`,
});

const meta = {
  title: "Données/BreakdownTable",
  component: BreakdownTable,
  args: {
    caption: "Exemple de répartition",
    rowHeader: "Joueur",
    totalLabel: "Total",
    columns: [
      {
        key: "ferme",
        label: "Ferme",
        parts: [
          { key: "sbires", label: "Sbires" },
          { key: "jungle", label: "Jungle" },
        ],
      },
      {
        key: "pression",
        label: "Pression",
        parts: [
          { key: "plaques", label: "Plaques" },
          { key: "tours", label: "Tours" },
        ],
      },
      {
        key: "combat",
        label: "Combat",
        parts: [{ key: "kills", label: "Kills" }],
      },
    ],
    split: { label: "Cédé", parts: ["Base", "Série"] },
    sections: [
      {
        key: "a",
        title: "Camp A",
        rows: [
          ligne("1", "Champion A", [4000, 200, 600, 300, 900], [1200, 0], true),
          ligne("2", "Champion B", [500, 4200, 100, 250, 1400], [900, 300]),
        ],
      },
      {
        key: "b",
        title: "Camp B",
        rows: [
          ligne("3", "Champion C", [3600, 0, 200, 250, 1800], [1500, 450]),
          ligne("4", "Champion D", [800, 3900, 0, 0, 700], [600, 0]),
        ],
      },
    ],
    format: (valeur: number) => valeur.toLocaleString("fr-FR"),
    toggleLabel: (colonne: string, ouverte: boolean) =>
      `${ouverte ? "Replier" : "Déplier"} ${colonne}`,
  },
} satisfies Meta<typeof BreakdownTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Repartition: Story = {};
