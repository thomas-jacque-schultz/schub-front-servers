import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Card } from "./Card";
import { DataTable } from "./DataTable";
import { Stack } from "./Stack";
import { StatusChip } from "./StatusChip";
import { Text } from "./Text";

interface LigneDemo {
  id: string;
  nom: string;
  jeu: string;
  statut: "online" | "offline" | "unknown" | "unreachable";
}

const LIGNES: LigneDemo[] = [
  { id: "1", nom: "Atelier des dunes", jeu: "Jeu de bac à sable", statut: "online" },
  { id: "2", nom: "Vallée close", jeu: "Jeu de survie", statut: "offline" },
  { id: "3", nom: "Phare nord", jeu: "Jeu d'exploration", statut: "unreachable" },
];

const COLONNES = [
  { key: "nom", header: "Nom", render: (ligne: LigneDemo) => <Text>{ligne.nom}</Text> },
  {
    key: "jeu",
    header: "Jeu",
    render: (ligne: LigneDemo) => (
      <Text tone="secondary" variant="caption">
        {ligne.jeu}
      </Text>
    ),
  },
  {
    key: "statut",
    header: "État",
    render: (ligne: LigneDemo) => <StatusChip status={ligne.statut} size="small" />,
  },
  {
    key: "actions",
    header: "Actions",
    align: "right" as const,
    width: 140,
    render: () => (
      <Button size="small" variant="secondary">
        Ouvrir
      </Button>
    ),
  },
];

const meta = {
  title: "Primitives/DataTable",
  component: DataTable<LigneDemo>,
  args: {
    columns: COLONNES,
    rows: LIGNES,
    rowKey: (ligne: LigneDemo) => ligne.id,
    caption: "Serveurs de démonstration",
    emptyTitle: "Aucun serveur",
    emptyDescription: "Les fiches créées depuis la configuration apparaîtront ici.",
    dense: false,
  },
} satisfies Meta<typeof DataTable<LigneDemo>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export const Dense: Story = { args: { dense: true } };

export const Vide: Story = { args: { rows: [] } };

export const DansUneCarte: Story = {
  render: (args) => (
    <Card title="État des serveurs" description="Trois fiches de démonstration.">
      <Stack spacing={0}>
        <DataTable {...args} />
      </Stack>
    </Card>
  ),
};

export const LigneEncadree: Story = {
  args: { rowAccent: (ligne: LigneDemo) => ligne.id === "2" },
};
