import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { IconButton } from "./IconButton";

const meta = {
  title: "Primitives/IconButton",
  component: IconButton,
  args: { icon: "refresh", label: "Actualiser la liste", size: "medium" },
  argTypes: {
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

export const LesEtats: Story = {
  render: () => (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton icon="refresh" label="Actualiser la liste" />
      <IconButton icon="refresh" label="Actualisation en cours" loading />
      <IconButton icon="delete" label="Suppression indisponible" disabled />
      <IconButton icon="delete" label="Supprimer la règle" destructive />
    </Stack>
  ),
};
