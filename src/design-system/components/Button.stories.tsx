import type { Meta, StoryObj } from "@storybook/react";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: {
    children: "Ajouter un serveur",
    variant: "primary",
    size: "medium",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primaire: Story = {};

export const Secondaire: Story = {
  args: { variant: "secondary", children: "Annuler" },
};

export const Fantome: Story = {
  args: { variant: "ghost", children: "Retour" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Supprimer la règle" },
};

export const EnChargement: Story = {
  args: { loading: true, children: "Enregistrement…" },
};

export const Desactive: Story = {
  args: { disabled: true },
};

export const AvecIcone: Story = {
  args: { startIcon: <AddIcon />, children: "Ajouter" },
};

export const ToutesLesVariantes: Story = {
  render: (args) => (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      <Button {...args} variant="primary">Principale</Button>
      <Button {...args} variant="secondary">Secondaire</Button>
      <Button {...args} variant="ghost">Discrète</Button>
      <Button {...args} variant="danger">Destructive</Button>
    </Stack>
  ),
};
