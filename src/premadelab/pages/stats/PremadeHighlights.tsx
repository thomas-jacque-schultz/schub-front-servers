import { useTranslation } from "react-i18next";
import {
  InsightCard,
  Stack,
  Text,
  VerdictMark,
  type Verdict,
} from "../../../common";
import type { PlayerStatsDto, StatLineDto } from "../../types/stats";
import { useStatsFormat } from "./statsFormat";

const PARTIES_MINIMUM = 5;
const RETENUS = 3;

type Cle =
  "winRate" | "killParticipation" | "kda" | "goldPerMinute" | "damagePerMinute";

// Un taux s'écarte en points (notable dès 5), un ratio en part de sa valeur (dès 15 %).
const MESURES: { cle: Cle; points: boolean }[] = [
  { cle: "winRate", points: true },
  { cle: "killParticipation", points: true },
  { cle: "kda", points: false },
  { cle: "goldPerMinute", points: false },
  { cle: "damagePerMinute", points: false },
];

interface Ecart {
  joueur: string;
  cle: Cle;
  points: boolean;
  delta: number;
  poids: number;
}

const ecarts = (joueur: PlayerStatsDto): Ecart[] => {
  const premade: StatLineDto | null = joueur.premade;
  const habitude = joueur.overall;
  if (!premade || !habitude || premade.games < PARTIES_MINIMUM) {
    return [];
  }
  return MESURES.flatMap(({ cle, points }) => {
    const a = premade[cle];
    const b = habitude[cle];
    if (typeof a !== "number" || typeof b !== "number" || b === 0) {
      return [];
    }
    const delta = points ? a - b : (a - b) / Math.abs(b);
    const poids = points ? Math.abs(delta) / 0.05 : Math.abs(delta) / 0.15;
    return poids >= 1
      ? [{ joueur: joueur.displayName ?? "?", cle, points, delta, poids }]
      : [];
  });
};

/** En tête de l'onglet Joueurs (Schub#95) : ce que le premade change pour chacun, face à ses propres habitudes. */
export function PremadeHighlights({ players }: { players: PlayerStatsDto[] }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const retenus = players
    .flatMap(ecarts)
    .sort((a, b) => b.poids - a.poids)
    .slice(0, RETENUS);
  if (retenus.length === 0) {
    return null;
  }
  const phrase = (e: Ecart) =>
    t("premadeHighlights.line", {
      player: e.joueur,
      metric: t(`premadeHighlights.metric.${e.cle}`),
      delta: e.points
        ? format.ecartEnPoints(e.delta)
        : `${e.delta > 0 ? "+" : ""}${Math.round(e.delta * 100)} %`,
    });
  const verdict = (e: Ecart): Verdict => (e.delta > 0 ? "above" : "below");
  return (
    <InsightCard
      title={t("premadeHighlights.title")}
      conclusion={phrase(retenus[0])}
      verdict={verdict(retenus[0])}
      visual={
        retenus.length > 1 ? (
          <Stack spacing={0.75}>
            {retenus.slice(1).map((e) => (
              <Stack
                key={`${e.joueur}-${e.cle}`}
                direction="row"
                spacing={1}
                align="center"
              >
                <VerdictMark verdict={verdict(e)} />
                <Text>{phrase(e)}</Text>
              </Stack>
            ))}
          </Stack>
        ) : undefined
      }
      details={
        <Text variant="caption" tone="secondary">
          {t("premadeHighlights.method", { count: PARTIES_MINIMUM })}
        </Text>
      }
      detailsLabel={t("verdict.details")}
      hideDetailsLabel={t("verdict.hideDetails")}
    />
  );
}
