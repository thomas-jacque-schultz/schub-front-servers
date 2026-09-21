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

/** Sans `count`, la cinquième passe à la ligne dès que le conteneur ne tient plus 5 × `minWidth`. */
export const Repliees: Story = {
  args: {
    minWidth: 260,
    children: POSTES.map(colonne),
  },
};

/** Avec `count`, les cinq tiennent sur une ligne au-dessus de `lg` : elles se resserrent. */
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
