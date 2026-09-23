import type { Meta, StoryObj } from "@storybook/react";
import { ChampionSlot } from "./ChampionSlot";

const meta = {
  title: "Données/ChampionSlot",
  component: ChampionSlot,
  args: { championName: "Champion", playerName: "Joueur A", caption: "5/2/7" },
} satisfies Meta<typeof ChampionSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AvecJoueur: Story = {};
export const Adversaire: Story = { args: { playerName: null, size: "small", framed: false, caption: "3/4/2" } };
