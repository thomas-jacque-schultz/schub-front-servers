import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Chip } from "./Chip";
import { Icon } from "./Icon";

const meta = {
  title: "Primitives/Chip",
  component: Chip,
  args: { label: "Permanente", tone: "primary", variant: "filled", size: "small" },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "primary", "secondary", "success", "warning", "error"],
    },
    variant: { control: "inline-radio", options: ["filled", "outline"] },
    size: { control: "inline-radio", options: ["small", "medium"] },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

/** Les six intentions, pleines puis en contour. */
export const LesIntentions: Story = {
  render: () => (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label="Neutre" tone="neutral" />
        <Chip label="Permanente" tone="primary" />
        <Chip label="Serveur" tone="secondary" />
        <Chip label="Ouverte" tone="success" />
        <Chip label="À vérifier" tone="warning" />
        <Chip label="En échec" tone="error" />
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label="Neutre" tone="neutral" variant="outline" />
        <Chip label="Permanente" tone="primary" variant="outline" />
        <Chip label="Serveur" tone="secondary" variant="outline" />
        <Chip label="Ouverte" tone="success" variant="outline" />
        <Chip label="À vérifier" tone="warning" variant="outline" />
        <Chip label="En échec" tone="error" variant="outline" />
      </Stack>
    </Stack>
  ),
};

/** Avec une icône du répertoire — ici le décompte des serveurs en ligne. */
export const AvecIcone: Story = {
  render: () => (
    <Chip label="2 serveurs en ligne sur 5" tone="success" icon={<Icon name="memory" />} />
  ),
};
