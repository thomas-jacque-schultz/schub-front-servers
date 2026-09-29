import type { Meta, StoryObj } from "@storybook/react";
import { fauxServeur, json } from "../../../../.storybook/fauxServeur";
import { PlayerRadar } from "./PlayerRadar";
import { grilleOr, ligne, references } from "./storyFixtures";

const auPoste = ligne("MIDDLE", null, 36, {
  damagePerMinute: 860,
  kda: 3.6,
  winRate: 0.58,
});
const meta = {
  title: "PremadeLab/Radar d'un joueur",
  component: PlayerRadar,
  args: { positions: [auPoste], references },
  decorators: [
    fauxServeur((url) =>
      url.pathname.includes("/lol/references/")
        ? json(grilleOr("MIDDLE"))
        : undefined,
    ),
  ],
} satisfies Meta<typeof PlayerRadar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FaceAuxAdversairesDirects: Story = {};

export const SansPartie: Story = {
  args: { positions: [], references: null },
};
