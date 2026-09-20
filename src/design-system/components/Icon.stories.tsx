import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ICON_NAMES, Icon } from "./Icon";

const meta = {
  title: "Primitives/Icon",
  component: Icon,
  args: { name: "refresh", size: "medium" },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

/**
 * Le répertoire entier. C'est la raison d'être de cette story : avant d'ajouter une icône, on
 * regarde ici si l'action a déjà la sienne.
 */
export const LeRepertoire: Story = {
  render: () => (
    <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
      {ICON_NAMES.map((name) => (
        <Stack key={name} spacing={0.5} alignItems="center" sx={{ width: 96 }}>
          <Icon name={name} />
          <Typography variant="caption" color="text.secondary">
            {name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  ),
};

/**
 * Avec un `label`, l'icône devient une image annoncée aux lecteurs d'écran ; sans, elle est
 * décorative et masquée. Le second cas est le bon quand un libellé voisin dit déjà la chose.
 */
export const DecorativeOuAnnoncee: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Icon name="storage" />
      <Icon name="storage" label="Stockage" />
    </Stack>
  ),
};
