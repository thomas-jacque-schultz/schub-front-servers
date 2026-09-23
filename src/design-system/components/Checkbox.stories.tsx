import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Stack } from "./Stack";
import { Text } from "./Text";

const meta = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  args: { checked: true, label: "Démarrer un serveur", disabled: false, onChange: () => {} },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cochee: Story = {};
export const Decochee: Story = { args: { checked: false } };
export const Desactivee: Story = { args: { disabled: true } };

export const SansLibelleVisible: Story = {
  args: { label: undefined, "aria-label": "Démarrer un serveur pour le rôle Modérateur" },
};

export const Interactive: Story = {
  render: function Interactive() {
    const [checked, setChecked] = useState(false);
    return (
      <Stack spacing={1}>
        <Checkbox checked={checked} onChange={setChecked} label="Arrêter un serveur" />
        <Text variant="caption" tone="secondary">
          {checked ? "Permission accordée" : "Permission retirée"}
        </Text>
      </Stack>
    );
  },
};
