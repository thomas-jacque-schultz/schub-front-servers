import type { Meta, StoryObj } from "@storybook/react";
import { GameFrame } from "./GameFrame";

const meta = {
  title: "Jeux/GameFrame",
  component: GameFrame,
  args: {
    src: "about:blank",
    title: "Questions pour un invocateur",
    icon: "🧠",
    back: { label: "Tous les jeux", to: "/" },
    room: "KQXP",
    roomLabel: "Salon",
    waitingLabel: "Ouverture du salon…",
    copyLabel: "Copier le lien",
    onCopy: () => {},
    fullscreenLabel: "Plein écran",
    exitFullscreenLabel: "Quitter le plein écran",
  },
} satisfies Meta<typeof GameFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DansUnSalon: Story = {};

export const AvantLeSalon: Story = {
  args: { room: null },
};
