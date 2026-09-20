import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Divider } from "./Divider";

const meta = {
  title: "Primitives/Divider",
  component: Divider,
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body2">Premier bloc</Typography>
      <Divider />
      <Typography variant="body2">Second bloc</Typography>
    </Stack>
  ),
};

/** Avec un intitulé, il découpe une liste longue en sections que l'œil retrouve. */
export const AvecIntitule: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body2">Salon #annonces</Typography>
      <Divider label="Guilde d'essai" />
      <Typography variant="body2">Salon #général</Typography>
    </Stack>
  ),
};
