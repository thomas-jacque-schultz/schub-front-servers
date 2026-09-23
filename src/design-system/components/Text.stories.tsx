import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "./Stack";
import { Text } from "./Text";

const meta = {
  title: "Primitives/Text",
  component: Text,
  args: { variant: "body", tone: "default", children: "Pilotage des serveurs de jeu" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["title", "section", "subtitle", "body", "caption", "overline"],
    },
    tone: {
      control: "inline-radio",
      options: ["default", "secondary", "disabled", "primary", "error"],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Corps: Story = {};

export const LesSixIntentions: Story = {
  render: () => (
    <Stack spacing={1.5}>
      <Text variant="overline" tone="primary">Section</Text>
      <Text variant="title">Titre d'écran</Text>
      <Text variant="section">Titre de bloc</Text>
      <Text variant="subtitle">Sous-titre</Text>
      <Text variant="body">Texte courant, celui qu'on lit vraiment.</Text>
      <Text variant="caption" tone="secondary">Mention discrète, datée ou chiffrée.</Text>
    </Stack>
  ),
};

export const LesTeintes: Story = {
  render: () => (
    <Stack spacing={1}>
      <Text tone="default">Teinte par défaut</Text>
      <Text tone="secondary">Secondaire</Text>
      <Text tone="disabled">Désactivée</Text>
      <Text tone="primary">Accent</Text>
      <Text tone="error">Erreur</Text>
    </Stack>
  ),
};

export const Tronque: Story = {
  args: {
    truncate: true,
    children: "Un libellé bien trop long pour la colonne qui doit l'accueillir sans la déformer",
  },
};
