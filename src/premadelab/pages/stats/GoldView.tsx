import { useTranslation } from "react-i18next";
import {
  BreakdownTable,
  Stack,
  Text,
  useLocaleFormat,
  type BreakdownColumn,
  type BreakdownRow,
} from "../../../common";
import type {
  GamePlayerGoldDto,
  TeamGameDetailDto,
  TeamGamePlayerDto,
} from "../../types/stats";
import { POSTES } from "./statsFormat";

export interface GoldViewProps {
  detail: TeamGameDetailDto;
}

type Source =
  | "start"
  | "passive"
  | "minions"
  | "allyJungle"
  | "enemyJungle"
  | "riverJungle"
  | "supportItem"
  | "roleQuest"
  | "plates"
  | "towers"
  | "other"
  | "kills"
  | "streaksTaken"
  | "assists";

// Inhibiteurs, nexus et monstres épiques valent presque toujours quelques dizaines d'or : regroupés en « Autres ».
const FAMILLES: {
  key: "passive" | "peaceful" | "objectives" | "players";
  sources: Source[];
}[] = [
  { key: "passive", sources: ["start", "passive"] },
  {
    key: "peaceful",
    sources: [
      "minions",
      "allyJungle",
      "enemyJungle",
      "riverJungle",
      "supportItem",
      "roleQuest",
    ],
  },
  { key: "objectives", sources: ["plates", "towers", "other"] },
  { key: "players", sources: ["kills", "streaksTaken", "assists"] },
];

const valeurs = (ligne: GamePlayerGoldDto): Record<Source, number> => ({
  start: ligne.start,
  passive: ligne.passive,
  minions: ligne.minions,
  allyJungle: ligne.allyJungle,
  enemyJungle: ligne.enemyJungle,
  riverJungle: ligne.riverJungle,
  supportItem: ligne.supportItem,
  roleQuest: ligne.roleQuest,
  plates: ligne.plates,
  towers: ligne.towers,
  other: ligne.inhibitors + ligne.objectives,
  kills: ligne.kills,
  streaksTaken: ligne.streaksTaken,
  assists: ligne.assists,
});

// D'où vient l'or de chaque joueur, et ce que ses morts ont donné à l'adversaire (Schub#179).
export function GoldView({ detail }: GoldViewProps) {
  const { t } = useTranslation("stats");
  const { formatNumber } = useLocaleFormat();
  const joueurs = [
    ...detail.game.players,
    ...detail.game.allies,
    ...detail.game.enemies,
  ];
  const notreCamp = detail.game.players[0]?.side ?? joueurs[0]?.side;
  const lignes = detail.gold;
  if (lignes.length === 0) {
    return null;
  }

  const joueurDe = (ligne: GamePlayerGoldDto): TeamGamePlayerDto | undefined =>
    joueurs.find(
      (joueur) =>
        joueur.side === ligne.side && joueur.championId === ligne.championId,
    );
  const rang = (poste: string | null) => {
    const index = POSTES.indexOf(poste as (typeof POSTES)[number]);
    return index < 0 ? POSTES.length : index;
  };
  const cede = (ligne: GamePlayerGoldDto) =>
    ligne.cededBase + ligne.cededStreak;

  const colonnes: BreakdownColumn[] = FAMILLES.map((famille) => ({
    key: famille.key,
    label: t(`gold.family.${famille.key}`),
    parts: famille.sources.map((source) => ({
      key: source,
      label: t(`gold.part.${source}`),
    })),
  }));

  const enLigne = (ligne: GamePlayerGoldDto): BreakdownRow => {
    const joueur = joueurDe(ligne);
    const morts = ligne.deaths.length;
    return {
      key: `${ligne.side}-${ligne.championId}`,
      label: joueur?.championName ?? String(ligne.championId),
      caption: joueur
        ? `${joueur.kills}/${joueur.deaths}/${joueur.assists}`
        : undefined,
      iconUrl: joueur?.iconUrl,
      highlight: Boolean(joueur?.memberId),
      values: valeurs(ligne),
      total: ligne.earned,
      last: {
        value: cede(ligne),
        note:
          ligne.cededStreak > 0
            ? t("gold.deathsStreak", {
                count: morts,
                streak: formatNumber(ligne.cededStreak),
              })
            : t("gold.deaths", { count: morts }),
      },
    };
  };

  const camp = (nous: boolean) =>
    lignes
      .filter((ligne) => (ligne.side === notreCamp) === nous)
      .sort((a, b) => rang(a.position) - rang(b.position))
      .map(enLigne);

  const donneur = [...lignes].sort((a, b) => cede(b) - cede(a))[0];

  return (
    <Stack spacing={1.5}>
      <Text variant="section">{t("gold.title")}</Text>
      <Text variant="body">
        {t("gold.topCeded", {
          champion: joueurDe(donneur)?.championName ?? "",
          gold: formatNumber(cede(donneur)),
          streak: formatNumber(donneur.cededStreak),
        })}
      </Text>
      <BreakdownTable
        caption={t("gold.caption")}
        rowHeader={t("gold.player")}
        totalLabel={t("gold.total")}
        columns={colonnes}
        sections={[
          { key: "nous", title: t("gold.ours"), rows: camp(true) },
          { key: "eux", title: t("gold.theirs"), rows: camp(false) },
        ]}
        lastLabel={t("gold.ceded")}
        format={formatNumber}
        toggleLabel={(colonne, ouverte) =>
          t(ouverte ? "gold.collapse" : "gold.expand", { column: colonne })
        }
      />
      <Text variant="caption" tone="secondary">
        {t("gold.method")}
      </Text>
    </Stack>
  );
}
