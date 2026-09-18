import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { TextField } from "./TextField";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  args: {
    open: true,
    title: "Changer le rôle de ce compte",
    description: "Le nouveau rôle prend effet à la prochaine requête du compte concerné.",
    confirmLabel: "Enregistrer",
    cancelLabel: "Annuler",
    destructive: false,
    maxWidth: "sm",
    onClose: () => {},
    onConfirm: () => {},
  },
  argTypes: { maxWidth: { control: "inline-radio", options: ["xs", "sm", "md"] } },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirmation: Story = {};

/**
 * Le bouton d'annulation est obligatoire, libellé compris : une modale sans sortie visible est
 * un piège, et la croix seule ne se voit pas au clavier.
 */
export const Destructive: Story = {
  args: {
    title: "Supprimer ce rôle",
    description: "Cette suppression est définitive. Un rôle encore porté par un compte ne peut pas être supprimé.",
    confirmLabel: "Supprimer",
    destructive: true,
  },
};

export const AvecFormulaire: Story = {
  args: { title: "Nouveau rôle", description: undefined },
  render: function AvecFormulaire(args) {
    const [nom, setNom] = useState("");
    return (
      <Dialog {...args}>
        <TextField label="Nom du rôle" value={nom} onChange={setNom} autoFocus />
      </Dialog>
    );
  },
};

/** Le cycle complet, pour vérifier la fermeture au clavier et au clic extérieur. */
export const Ouvrable: Story = {
  args: { open: false },
  render: function Ouvrable(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Ouvrir la boîte de dialogue</Button>
        <Dialog {...args} open={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </>
    );
  },
};
