import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";
import { Stack } from "./Stack";

const meta = {
  title: "Primitives/Alert",
  component: Alert,
  args: { severity: "info", children: "Le catalogue des déploiements est indisponible." },
  argTypes: {
    severity: { control: "inline-radio", options: ["info", "success", "warning", "error"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Information: Story = {};

export const AvecTitre: Story = {
  args: {
    severity: "warning",
    title: "Vue partielle",
    children: "Ports et administrateurs demandent la permission d'infrastructure.",
  },
};

export const LesQuatreNiveaux: Story = {
  render: () => (
    <Stack spacing={1.5}>
      <Alert severity="info">La fiche est en consultation seule.</Alert>
      <Alert severity="success">Rôle enregistré.</Alert>
      <Alert severity="warning">Le routeur n'a pas répondu : les redirections datent.</Alert>
      <Alert severity="error">L'enregistrement a échoué.</Alert>
    </Stack>
  ),
};

export const Fermable: Story = {
  args: { severity: "success", children: "Sélection enregistrée.", onClose: () => {} },
};
