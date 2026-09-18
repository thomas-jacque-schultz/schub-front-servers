import type { Meta, StoryObj } from "@storybook/react";
import Typography from "@mui/material/Typography";
import { Button } from "./Button";
import { Card } from "./Card";

const meta = {
  title: "Primitives/Card",
  component: Card,
  args: {
    title: "Redirections de ports",
    description: "Ce que le routeur expose. Données d'exemple : rien ici ne vient d'un vrai réseau.",
    children: (
      <Typography variant="body2" color="text.secondary">
        Le contenu de la carte prend place ici : un tableau, un formulaire, une liste.
      </Typography>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

/** Sans en-tête : la carte n'est plus qu'une surface. */
export const SansEnTete: Story = {
  args: { title: undefined, description: undefined },
};

export const AvecActions: Story = {
  args: {
    actions: <Button size="small" variant="secondary">Actualiser</Button>,
  },
};

/** Pour un tableau qui doit toucher les bords de la carte. */
export const SansGouttiere: Story = {
  args: { disablePadding: true, title: undefined, description: undefined },
};
