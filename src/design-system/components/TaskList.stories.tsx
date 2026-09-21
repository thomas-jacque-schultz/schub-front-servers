import type { Meta, StoryObj } from "@storybook/react";
import { TaskList } from "./TaskList";

const meta = {
  title: "Données/TaskList",
  component: TaskList,
  args: {
    items: [
      {
        key: "a",
        label: "Lier son compte de jeu",
        description: "Sans lui, les statistiques n'ont rien à compter",
        state: "todo",
        href: "/profil",
      },
      {
        key: "b",
        label: "Choisir son nom d'affichage",
        state: "todo",
        href: "/profil",
      },
    ],
    doneLabel: "Tout est en place.",
  },
} satisfies Meta<typeof TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AFaire: Story = {};

/** « En attente » n'est pas « à faire » : rien n'est demandé, il n'y a qu'à patienter. */
export const EnAttente: Story = {
  args: {
    items: [
      {
        key: "a",
        label: "Vérification du compte en cours",
        description: "Le geste est posé, la réponse arrive",
        state: "pending",
        href: "/profil",
      },
    ],
  },
};

/** Ce qui est fait reste affiché : une liste qui raccourcit sans rien dire laisse douter. */
export const Melange: Story = {
  args: {
    items: [
      { key: "a", label: "Compte de jeu lié", state: "done" },
      { key: "b", label: "Choisir son nom d'affichage", state: "todo", href: "/profil" },
    ],
  },
};

export const RienAFaire: Story = {
  args: { items: [] },
};
