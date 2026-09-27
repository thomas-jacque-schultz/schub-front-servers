import { useTranslation } from "react-i18next";
import {
  Card,
  Columns,
  StatGrid,
  Stack,
  Text,
  type StatGridItem,
} from "../../../common";
import { FindingList } from "../../components/Findings";
import type { FindingDto } from "../../types/findings";
import type { MyStatsDto, StatLineDto, TeamGameDto } from "../../types/stats";
import { useMetrics, type MetricKey } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useReferenceGrid } from "./useReferenceGrid";

const PALIERS = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
];
const TROIS = 3;
// Sous ce nombre de parties, un taux de victoire par créneau ne dit rien.
const PARTIES_MIN = 5;

const top = (findings: FindingDto[], polarity: FindingDto["polarity"]) =>
  findings.filter((f) => f.polarity === polarity).slice(0, TROIS);

/** L'en-tête de Mes stats : trois points forts, trois points faibles, chacun dépliable sur sa preuve. */
export function FindingsSummary({ findings }: { findings: FindingDto[] }) {
  const { t } = useTranslation("lol");
  if (findings.length === 0) {
    return null;
  }
  return (
    <Columns count={2} minWidth={320}>
      <Card title={t("behaviour.strengths")}>
        <FindingList findings={top(findings, "STRENGTH")} />
      </Card>
      <Card title={t("behaviour.weaknesses")}>
        <FindingList findings={top(findings, "WEAKNESS")} />
      </Card>
    </Columns>
  );
}

interface Creneau {
  key: "morning" | "afternoon" | "evening" | "night";
  games: number;
  wins: number;
}

const creneauDe = (date: Date): Creneau["key"] => {
  const heure = date.getHours();
  if (heure >= 6 && heure < 12) return "morning";
  if (heure >= 12 && heure < 18) return "afternoon";
  if (heure >= 18) return "evening";
  return "night";
};

/** Taux de victoire par créneau horaire, et après deux défaites d'affilée : des faits, pas une règle. */
const habitudes = (games: TeamGameDto[]) => {
  const creneaux: Record<Creneau["key"], Creneau> = {
    morning: { key: "morning", games: 0, wins: 0 },
    afternoon: { key: "afternoon", games: 0, wins: 0 },
    evening: { key: "evening", games: 0, wins: 0 },
    night: { key: "night", games: 0, wins: 0 },
  };
  const chronologie = games
    .filter((g) => g.startedAt && g.win !== null)
    .sort((a, b) => (a.startedAt! < b.startedAt! ? -1 : 1));
  let apresDeux = { games: 0, wins: 0 };
  chronologie.forEach((game, index) => {
    const c = creneaux[creneauDe(new Date(game.startedAt!))];
    c.games++;
    if (game.win) c.wins++;
    if (
      index >= 2 &&
      chronologie[index - 1].win === false &&
      chronologie[index - 2].win === false
    ) {
      apresDeux = {
        games: apresDeux.games + 1,
        wins: apresDeux.wins + (game.win ? 1 : 0),
      };
    }
  });
  const total = chronologie.length;
  const victoires = chronologie.filter((g) => g.win).length;
  return { creneaux: Object.values(creneaux), apresDeux, total, victoires };
};

export interface BehaviourPanelProps {
  findings: FindingDto[];
  stats: MyStatsDto | null;
  games: TeamGameDto[];
}

export function BehaviourPanel({
  findings,
  stats,
  games,
}: BehaviourPanelProps) {
  const { t } = useTranslation("lol");
  const format = useStatsFormat();
  const { definitions } = useMetrics();

  const poste = stats?.references?.position ?? null;
  const palier = stats?.references?.tier ?? null;
  const suivant = palier
    ? (PALIERS[PALIERS.indexOf(palier) + 1] ?? null)
    : null;
  const grille = useReferenceGrid(poste, "MEAN", palier);
  const ligne: StatLineDto | undefined = stats?.positions.find(
    (p) => p.key === poste,
  );

  // Ce qui manque pour le palier suivant : les indicateurs qui suivent le rang (rankMeans), où l'on est
  // en deçà de la moyenne du palier au-dessus. Les écarts à somme nulle n'y entrent pas.
  const manques =
    grille && ligne && suivant
      ? (Object.keys(definitions) as MetricKey[])
          .map((cle) => {
            const moyenne = grille.metrics[cle]?.rankMeans?.[suivant];
            const valeur = (ligne as unknown as Record<string, number | null>)[
              cle
            ];
            const sens = definitions[cle].polarity;
            if (
              moyenne === undefined ||
              valeur === null ||
              valeur === undefined ||
              sens === "neutral"
            ) {
              return null;
            }
            const retard =
              sens === "higher"
                ? (moyenne - valeur) / Math.abs(moyenne || 1)
                : (valeur - moyenne) / Math.abs(moyenne || 1);
            return retard > 0 ? { cle, valeur, moyenne, retard } : null;
          })
          .filter((m): m is NonNullable<typeof m> => m !== null)
          .sort((a, b) => b.retard - a.retard)
          .slice(0, 4)
      : [];

  const h = habitudes(games);
  const taux = (wins: number, total: number) =>
    total >= PARTIES_MIN ? format.taux(wins / total) : format.absent;
  const tuiles: StatGridItem[] = [
    ...h.creneaux.map((c) => ({
      key: c.key,
      label: t(`behaviour.slot.${c.key}`),
      value: taux(c.wins, c.games),
      hint: t("behaviour.games", { count: c.games }),
    })),
    {
      key: "afterTwoLosses",
      label: t("behaviour.afterTwoLosses"),
      value: taux(h.apresDeux.wins, h.apresDeux.games),
      hint: t("behaviour.versusAll", { value: taux(h.victoires, h.total) }),
    },
  ];

  const style = findings.filter((f) => f.polarity === "NEUTRAL");
  const actions = findings.filter(
    (f) => f.nature === "ACTION" && f.polarity !== "NEUTRAL",
  );
  const consequences = findings.filter(
    (f) => f.nature === "CONSEQUENCE" && f.polarity !== "NEUTRAL",
  );

  return (
    <Stack spacing={3}>
      <Card
        title={t("behaviour.toWork")}
        description={t("behaviour.toWorkHint")}
      >
        <FindingList findings={top(findings, "WEAKNESS")} />
      </Card>
      <Card title={t("behaviour.style")}>
        <FindingList findings={style} />
      </Card>
      <Columns count={2} minWidth={320}>
        <Card
          title={t("behaviour.actions")}
          description={t("behaviour.actionsHint")}
        >
          <FindingList findings={actions} />
        </Card>
        <Card
          title={t("behaviour.consequences")}
          description={t("behaviour.consequencesHint")}
        >
          <FindingList findings={consequences} />
        </Card>
      </Columns>
      <Card
        title={t("behaviour.habits")}
        description={t("behaviour.habitsHint")}
      >
        <StatGrid items={tuiles} />
      </Card>
      {suivant && (
        <Card
          title={t("behaviour.nextTier", {
            tier: t(`tier.${suivant}`, { ns: "stats", defaultValue: suivant }),
          })}
          description={t("behaviour.nextTierHint")}
        >
          {manques.length === 0 ? (
            <Text tone="secondary">{t("behaviour.nextTierNone")}</Text>
          ) : (
            <Stack spacing={1}>
              {manques.map((m) => (
                <Text key={m.cle}>
                  {t("behaviour.gap", {
                    metric: definitions[m.cle].label,
                    value: definitions[m.cle].format(m.valeur),
                    target: definitions[m.cle].format(m.moyenne),
                  })}
                </Text>
              ))}
            </Stack>
          )}
        </Card>
      )}
      <Text variant="caption" tone="secondary">
        {t("behaviour.unobservable")}
      </Text>
    </Stack>
  );
}
