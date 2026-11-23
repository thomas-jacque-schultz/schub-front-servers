import { useTranslation } from "react-i18next";
import {
  BreakdownSplitLegend,
  BreakdownTable,
  DotStrip,
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

type Part = Exclude<
  keyof GamePlayerGoldDto,
  | "side"
  | "championId"
  | "position"
  | "earned"
  | "start"
  | "passive"
  | "cededBase"
  | "cededStreak"
  | "deaths"
>;

// Le socle (or de départ et revenu passif) est le même pour les dix : il est dit une fois, pas mis en colonne.
const FAMILLES: { key: "farm" | "pressure" | "fight"; parts: Part[] }[] = [
  {
    key: "farm",
    parts: [
      "minions",
      "allyJungle",
      "enemyJungle",
      "riverJungle",
      "supportItem",
      "roleQuest",
    ],
  },
  { key: "pressure", parts: ["plates", "towers", "inhibitors", "objectives"] },
  { key: "fight", parts: ["kills", "streaksTaken", "assists"] },
];

const mmss = (secondes: number) =>
  `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}`;

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
  const duree = detail.game.durationSeconds;
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
  const plusGrosseMort = Math.max(
    1,
    ...lignes.flatMap((ligne) => ligne.deaths.map((mort) => mort.gold)),
  );

  const colonnes: BreakdownColumn[] = FAMILLES.map((famille) => ({
    key: famille.key,
    label: t(`gold.family.${famille.key}`),
    parts: famille.parts.map((part) => ({
      key: part,
      label: t(`gold.part.${part}`),
    })),
  }));

  const enLigne = (ligne: GamePlayerGoldDto): BreakdownRow => {
    const joueur = joueurDe(ligne);
    const champion = joueur?.championName ?? String(ligne.championId);
    const kda = joueur
      ? `${joueur.kills}/${joueur.deaths}/${joueur.assists}`
      : null;
    const cede = ligne.cededBase + ligne.cededStreak;
    const morts = ligne.deaths.length;
    return {
      key: `${ligne.side}-${ligne.championId}`,
      label: champion,
      caption: [joueur?.displayName, kda].filter(Boolean).join(" · "),
      iconUrl: joueur?.iconUrl,
      highlight: Boolean(joueur?.memberId),
      values: Object.fromEntries(
        FAMILLES.flatMap((famille) =>
          famille.parts.map((part) => [part, ligne[part]]),
        ),
      ),
      total: ligne.earned,
      split: [ligne.cededBase, ligne.cededStreak],
      splitCaption:
        morts === 0
          ? t("gold.noDeath")
          : t("gold.cededCaption", {
              gold: formatNumber(cede),
              count: morts,
              perDeath: formatNumber(Math.round(cede / morts)),
            }),
      splitDetail:
        morts === 0 ? undefined : (
          <DotStrip
            duration={duree}
            maxValue={plusGrosseMort}
            ariaLabel={t("gold.deathsAria", { champion })}
            points={ligne.deaths.map((mort, index) => ({
              key: String(index),
              at: mort.second,
              value: mort.gold,
              emphasis: mort.streak > 0,
              label:
                mort.streak > 0
                  ? t("gold.deathWithStreak", {
                      time: mmss(mort.second),
                      gold: formatNumber(mort.gold),
                      streak: formatNumber(mort.streak),
                    })
                  : t("gold.death", {
                      time: mmss(mort.second),
                      gold: formatNumber(mort.gold),
                    }),
            }))}
          />
        ),
    };
  };

  const camp = (nous: boolean) =>
    lignes
      .filter((ligne) => (ligne.side === notreCamp) === nous)
      .sort((a, b) => rang(a.position) - rang(b.position))
      .map(enLigne);

  const donneur = [...lignes].sort(
    (a, b) => b.cededBase + b.cededStreak - (a.cededBase + a.cededStreak),
  )[0];
  const socle = lignes[0].start + lignes[0].passive;

  return (
    <Stack spacing={1.5}>
      <Text variant="section">{t("gold.title")}</Text>
      <Stack spacing={0.5}>
        <Text variant="body">
          {t("gold.topCeded", {
            champion: joueurDe(donneur)?.championName ?? "",
            gold: formatNumber(donneur.cededBase + donneur.cededStreak),
            streak: formatNumber(donneur.cededStreak),
          })}
        </Text>
        <Text variant="caption" tone="secondary">
          {t("gold.socle", { gold: formatNumber(socle) })}
        </Text>
      </Stack>
      <BreakdownSplitLegend
        parts={[t("gold.cededBase"), t("gold.cededStreak")]}
      />
      <BreakdownTable
        caption={t("gold.caption")}
        rowHeader={t("gold.player")}
        totalLabel={t("gold.total")}
        columns={colonnes}
        sections={[
          { key: "nous", title: t("gold.ours"), rows: camp(true) },
          { key: "eux", title: t("gold.theirs"), rows: camp(false) },
        ]}
        split={{
          label: t("gold.ceded"),
          parts: [t("gold.cededBase"), t("gold.cededStreak")],
        }}
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
