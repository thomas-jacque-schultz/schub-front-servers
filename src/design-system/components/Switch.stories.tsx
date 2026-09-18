import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  args: { checked: true, label: "Notifications activées", disabled: false, onChange: () => {} },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Le libellé s'écrit à l'état, pas à l'action — « Notifications activées », jamais « Activer » :
 * sinon on ne sait plus si on lit l'état courant ou le bouton qui le change.
 */
export const Activee: Story = {};
export const Desactivee: Story = { args: { checked: false } };
export const Figee: Story = { args: { disabled: true } };

export const AvecPrecision: Story = {
  args: { helperText: "le salon reçoit les changements d'état" },
};

export const Interactive: Story = {
  render: function Interactive() {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        checked={checked}
        onChange={setChecked}
        label={checked ? "Redirection ouverte" : "Redirection fermée"}
      />
    );
  },
};
