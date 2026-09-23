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
