import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Toast } from "./Toast";

const meta = {
  title: "Primitives/Toast",
  component: Toast,
  args: {
    open: true,
    message: "Rôle enregistré.",
    severity: "success",
    autoHideMs: 4000,
    onClose: () => {},
  },
  argTypes: {
    severity: { control: "inline-radio", options: ["info", "success", "warning", "error"] },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {};

/**
 * Une notification convient à ce qu'on peut manquer sans conséquence. Une erreur qu'il faut
 * corriger reste sur l'écran, dans un `Alert` — sinon elle disparaît avant d'être lue.
 */
export const Erreur: Story = {
  args: { severity: "error", message: "Le cœur a refusé : ce rôle est plus puissant que le vôtre.", autoHideMs: 8000 },
};

export const Declenchable: Story = {
  args: { open: false },
  render: function Declenchable(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Enregistrer</Button>
        <Toast {...args} open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
};
