import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Columns } from "./Columns";
import { Text } from "./Text";

const meta = {
  title: "Mise en page/Columns",
  component: Columns,
} satisfies Meta<typeof Columns>;

export default meta;
type Story = StoryObj<typeof meta>;

const POSTES = ["Haut", "Jungle", "Milieu", "Bas", "Support"];

const colonne = (titre: string) => (
  <Card key={titre} title={titre}>
    <Text variant="caption" tone="secondary">
      Contenu de la colonne
    </Text>
  </Card>
);

export const Repliees: Story = {
  args: {
    minWidth: 260,
    children: POSTES.map(colonne),
  },
};

export const CinqSurUneLigne: Story = {
  args: {
    minWidth: 260,
    count: 5,
    children: POSTES.map(colonne),
  },
};

export const Etroites: Story = {
  args: {
    minWidth: 140,
    children: ["Un", "Deux", "Trois", "Quatre", "Cinq", "Six"].map(colonne),
  },
};
