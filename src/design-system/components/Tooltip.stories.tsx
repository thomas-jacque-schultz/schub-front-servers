import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  args: {
    title: "Dernière actualisation à 14:32",
    placement: "top",
    children: <Button variant="secondary">Actualiser</Button>,
  },
  argTypes: {
    placement: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SurUnBouton: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Actualiser</Button>
    </Tooltip>
  ),
};

export const SurUnBoutonDesactive: Story = {
  render: () => (
    <Tooltip title="Cette redirection vient d'un serveur : elle se retire depuis sa fiche.">
      <Button variant="secondary" disabled>
        Supprimer
      </Button>
    </Tooltip>
  ),
};

export const TitreVide: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Tooltip title="">
        <Button variant="ghost">Sans infobulle</Button>
      </Tooltip>
    </Stack>
  ),
};
