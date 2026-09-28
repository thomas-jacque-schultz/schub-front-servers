import type { Meta, StoryObj } from "@storybook/react";
import { fauxServeur, json } from "../../../../.storybook/fauxServeur";
import { PlayerRadar } from "./PlayerRadar";
import { grilleOr, ligne, references } from "./storyFixtures";

const joueur = ligne("overall", null, 48);
const auPoste = ligne("MIDDLE", null, 36, {
  damagePerMinute: 860,
  kda: 3.6,
  winRate: 0.58,
});
const equipe = [
  joueur,
  ligne("b", null, 40, {
    damagePerMinute: 620,
    goldPerMinute: 380,
    kda: 2.4,
    winRate: 0.5,
  }),
  ligne("c", null, 44, {
    damagePerMinute: 910,
    visionPerMinute: 0.6,
    deathShare: 0.24,
  }),
  ligne("d", null, 39, {
    killParticipation: 0.68,
    visionPerMinute: 1.6,
    damagePerMinute: 390,
  }),
];

const meta = {
  title: "PremadeLab/Radar d'un joueur",
  component: PlayerRadar,
  args: { overall: joueur, positions: [auPoste], references },
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

export const FaceAuxAdversairesDirects: Story = { args: { reference: "met" } };

export const FaceAuPalier: Story = { args: { reference: "league" } };

export const FaceALEquipe: Story = {
  args: { reference: "team", teamLines: equipe },
};

export const JoueurNonClasse: Story = {
  args: { reference: "league", references: { ...references, tier: null } },
};

export const SansPartie: Story = {
  args: { overall: null, positions: [], references: null },
};
