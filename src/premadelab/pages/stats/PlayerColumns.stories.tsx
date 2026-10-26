import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AlignedColumns } from "../../../common";
import type { PlayerStatsDto } from "../../types/stats";
import { championsEnColonne } from "./champions";
import { playerColumn } from "./playerColumn";
import { lignesPremade } from "./premade";
import { ligne, references } from "./storyFixtures";

const joueur = (
  memberId: string,
  nom: string,
  champions: PlayerStatsDto["champions"],
  premade: PlayerStatsDto["premade"],
): PlayerStatsDto => ({
  memberId,
  displayName: nom,
  avatarUrl: null,
  riotGameName: nom,
  riotTagLine: "EUW",
  status: "TITULAIRE",
  roles: ["MID"],
  linked: true,
  state: "STATISTIQUES_CONNUES",
  coverage: null,
  overall: ligne("all", null, 40),
  champions,
  positions: [],
  queues: [],
  months: [],
  rankings: [],
  references,
  premade,
});

// Des noms de longueurs différentes et un joueur à deux champions : c'est ce qui décalait les cartes.
const JOUEURS = [
  joueur(
    "a",
    "Alpha",
    [
      ligne("61", "Orianna", 23),
      ligne("103", "Ahri", 12),
      ligne("7", "LeBlanc", 5),
    ],
    ligne("premade", null, 22, {
      winRate: 0.45,
      kda: 3.1,
      damagePerMinute: 720,
    }),
  ),
  joueur(
    "b",
    "Bravo",
    [
      ligne("711", "Vex", 18),
      ligne("163", "Taliyah", 9, { goldDiffAt15: null, laningGames: 0 }),
    ],
    ligne("premade", null, 22, {
      winRate: 0.55,
      kda: 2.4,
      damagePerMinute: 610,
    }),
  ),
  joueur(
    "c",
    "Charlie",
    [
      ligne("136", "Aurelion Sol", 30),
      ligne("518", "Neeko", 4),
      ligne("268", "Azir", 3),
    ],
    null,
  ),
  joueur(
    "d",
    "Delta",
    [ligne("84", "Akali", 14), ligne("238", "Zed", 6)],
    ligne("premade", null, 22, {
      winRate: 0.5,
      kda: 2.8,
      damagePerMinute: 680,
    }),
  ),
  joueur(
    "e",
    "Echo",
    [ligne("99", "Lux", 20)],
    ligne("premade", null, 22, {
      winRate: 0.6,
      kda: 3.6,
      damagePerMinute: 590,
    }),
  ),
];

// Une équipe complète garde son radar (Schub#158) : cinq colonnes au plus large du bandeau.
function Colonnes({ nombre }: { nombre: number }) {
  const joueurs = JOUEURS.slice(0, nombre);
  const [choix, setChoix] = useState<Record<string, string[]>>({});
  const championRows = Math.max(
    ...joueurs.map(
      (p) => championsEnColonne(p, choix[p.memberId] ?? []).length,
    ),
  );
  return (
    <AlignedColumns
      minWidth={220}
      count={joueurs.length}
      columns={joueurs.map((player) =>
        playerColumn(player, {
          isViewer: false,
          showRadar: true,
          denseRadar: joueurs.length > 3,
          premadeLines: lignesPremade(joueurs),
          champions: choix[player.memberId] ?? [],
          onChampionsChange: (keys) =>
            setChoix((avant) => ({ ...avant, [player.memberId]: keys })),
          championRows,
        }),
      )}
    />
  );
}

const meta = {
  title: "PremadeLab/Colonnes de joueurs",
  component: Colonnes,
} satisfies Meta<typeof Colonnes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TroisJoueurs: Story = { args: { nombre: 3 } };

export const CinqJoueurs: Story = { args: { nombre: 5 } };
