import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { DiscordIcon } from "./DiscordIcon";
import { Stack } from "./Stack";
import { Text } from "./Text";

const meta = {
  title: "Primitives/DiscordIcon",
  component: DiscordIcon,
  args: { fontSize: "medium" },
  argTypes: {
    fontSize: { control: "inline-radio", options: ["small", "medium", "large", "inherit"] },
  },
} satisfies Meta<typeof DiscordIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seule: Story = {};

/**
 * Son unique emploi réel : l'entrée principale de l'écran de connexion.
 *
 * <p>Le libellé porte tout le sens — l'icône est décorative et n'est pas annoncée. C'est ce qui
 * évite le « Discord Se connecter avec Discord » qu'on entend sur les boutons où l'icône a été
 * étiquetée elle aussi.</p>
 */
export const DansUnBouton: Story = {
  render: (args) => (
    <Button startIcon={<DiscordIcon {...args} />} size="large">
      Se connecter avec Discord
    </Button>
  ),
};

/** Elle hérite de `currentColor` : c'est le bouton qui décide de la teinte, pas elle. */
export const HeriteDeLaCouleur: Story = {
  render: (args) => (
    <Stack spacing={2} align="start">
      <Button startIcon={<DiscordIcon {...args} />}>Bouton principal</Button>
      <Button variant="secondary" startIcon={<DiscordIcon {...args} />}>
        Bouton secondaire
      </Button>
      <Text tone="secondary" variant="caption">
        Aucune couleur de marque n&apos;est peinte dans l&apos;icône.
      </Text>
    </Stack>
  ),
};
