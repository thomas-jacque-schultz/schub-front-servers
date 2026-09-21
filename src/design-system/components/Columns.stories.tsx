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

const colonne = (titre: string) => (
  <Card key={titre} title={titre}>
    <Text variant="caption" tone="secondary">
      Contenu de la colonne
    </Text>
  </Card>
);

/** Cinq colonnes sur un écran large, moins dès qu'il rétrécit — sans nombre codé en dur. */
export const Cinq: Story = {
  args: {
    children: ["Haut", "Jungle", "Milieu", "Bas", "Support"].map(colonne),
  },
};

export const Etroites: Story = {
  args: {
    minWidth: 140,
    children: ["Un", "Deux", "Trois", "Quatre", "Cinq", "Six"].map(colonne),
  },
};
