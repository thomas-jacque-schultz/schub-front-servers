import type { Meta, StoryObj } from "@storybook/react";
import { ChampionStatCard } from "./ChampionStatCard";
import { ligne, references } from "./storyFixtures";

const meta = {
  title: "PremadeLab/Carte d'un champion",
  component: ChampionStatCard,
  args: {
    line: ligne("61", "Orianna", 23, { winRate: 0.61, kda: 3.9 }),
    references,
  },
} satisfies Meta<typeof ChampionStatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {};

export const Compacte: Story = { args: { compact: true } };

export const PeuDeParties: Story = {
  args: {
    line: ligne("103", "Ahri", 2, {
      winRate: 0.5,
      kda: 1.8,
      laningGames: 0,
      goldDiffAt15: null,
    }),
  },
};
