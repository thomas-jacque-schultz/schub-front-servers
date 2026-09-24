import { useTranslation } from "react-i18next";
import {
  Alert,
  ChampionSlot,
  Columns,
  ComparisonTile,
  Dialog,
  Stack,
  Text,
} from "../../../design-system";
import type {
  GamePlayerMetricsDto,
  TeamGamePlayerDto,
} from "../../types/stats";
import { noter } from "./grading";
import { GradeLabel } from "./LevelCrest";
import { FAMILLES, type MetricKey, useMetrics } from "./metrics";
import { useStatsFormat } from "./statsFormat";
import { useReferenceGrid } from "./useReferenceGrid";

export interface PlayerGameDialogProps {
  player: TeamGamePlayerDto | null;
  metrics: GamePlayerMetricsDto | null;
  avatar?: string | null;
  onClose: () => void;
}

/** Une partie d'un joueur, famille par famille : la valeur, sa moyenne au même poste, le rang auquel elle correspond. */
export function PlayerGameDialog({
  player,
  metrics,
  avatar,
  onClose,
}: PlayerGameDialogProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();

  const nom = player
    ? (player.displayName ?? player.championName ?? String(player.championId))
    : "";
  return (
    <Dialog
      open={player !== null}
      title={t("playerGame.title", { player: nom })}
      cancelLabel={t("detail.close")}
      onClose={onClose}
      maxWidth="lg"
    >
      {player && (
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} align="center" wrap>
            <ChampionSlot
              championName={player.championName ?? String(player.championId)}
              championIcon={player.iconUrl}
              playerName={player.displayName}
              playerAvatar={avatar}
              caption={`${player.kills}/${player.deaths}/${player.assists}`}
            />
            <Stack spacing={0.25}>
              <Text variant="subtitle">
                {[player.championName, format.poste(player.position ?? "")]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <Text variant="caption" tone="secondary">
                {metrics?.average
                  ? t("playerGame.averageBasis", {
                      count: metrics.average.games,
                      position: format.poste(metrics.average.key),
                    })
                  : t("playerGame.noAverage")}
              </Text>
              {metrics?.tier && (
                <Text variant="caption" tone="secondary">
                  {t(
                    metrics.tierEstimated
                      ? "playerGame.tierEstimated"
                      : "playerGame.tier",
                    {
                      tier: t(`tier.${metrics.tier}`, {
                        defaultValue: metrics.tier,
                      }),
                    },
                  )}
                </Text>
              )}
            </Stack>
          </Stack>
          {metrics ? (
            <Familles metrics={metrics} />
          ) : (
            <Alert severity="info">{t("playerGame.noMetrics")}</Alert>
          )}
          <Text variant="caption" tone="secondary">
            {t("playerGame.rankHelper")}
          </Text>
        </Stack>
      )}
    </Dialog>
  );
}

function Familles({ metrics }: { metrics: GamePlayerMetricsDto }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { definitions } = useMetrics();
  const position =
    metrics.position && metrics.position !== "UNKNOWN"
      ? metrics.position
      : null;
  const grille = useReferenceGrid(position, "GAME", metrics.tier);

  const rang = (key: MetricKey, valeur: number | null | undefined) => {
    const grade =
      grille && position
        ? noter(valeur, grille.metrics[key], grille, metrics.tier)
        : null;
    return grade && position ? (
      <GradeLabel
        grade={grade}
        position={position}
        patches={grille?.patches ?? []}
        scope="GAME"
        format={definitions[key].format}
      />
    ) : (
      format.absent
    );
  };

  const ton = (
    key: MetricKey,
    partie: number | null | undefined,
    moyenne: number | null | undefined,
  ) => {
    const sens = definitions[key].polarity;
    if (
      partie === null ||
      partie === undefined ||
      moyenne === null ||
      moyenne === undefined ||
      sens === "neutral"
    ) {
      return "neutral" as const;
    }
    if (partie === moyenne) {
      return "neutral" as const;
    }
    return partie > moyenne === (sens === "higher")
      ? ("positive" as const)
      : ("negative" as const);
  };

  return (
    <Stack spacing={2.5}>
      {FAMILLES.map((famille) => (
        <Stack key={famille.key} spacing={1}>
          <Text variant="section">
            {t(`family.${famille.key}`, { defaultValue: famille.key })}
          </Text>
          <Columns minWidth={230} spacing={1.5}>
            {famille.metrics.map((key) => {
              const partie = metrics.game[key];
              const moyenne = metrics.average ? metrics.average[key] : null;
              return (
                <ComparisonTile
                  key={key}
                  title={definitions[key].label}
                  entries={[
                    {
                      label: t("playerGame.game"),
                      value: definitions[key].format(partie),
                      tone: ton(key, partie, moyenne),
                    },
                    {
                      label: t("playerGame.average"),
                      value: definitions[key].format(moyenne),
                    },
                    { label: t("playerGame.rank"), value: rang(key, partie) },
                  ]}
                />
              );
            })}
          </Columns>
        </Stack>
      ))}
    </Stack>
  );
}
