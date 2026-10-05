import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Columns,
  MeterBar,
  Stack,
  Text,
  TrendChart,
  useLocaleFormat,
} from "../../../common";
import type { MyStatsDto, StatLineDto } from "../../types/stats";
import { ChampionChoice } from "./ChampionChoice";
import { championsAffiches } from "./champions";
import { ChampionStatCard } from "./ChampionStatCard";
import { GameAnalysis } from "./GameAnalysis";
import { PlayerHighlights } from "./PlayerHighlights";
import { PlayerRadar } from "./PlayerRadar";
import { QueuePie } from "./QueuePie";
import { RankedStandings } from "./RankedStandings";
import { StatsStateNote } from "./StatsStateNote";
import { useStatsFormat } from "./statsFormat";

const CHAMPIONS_PLEINE_LARGEUR = 8;
const CHAMPIONS_VISIBLES = 4;
// Un poste ne se dit « meilleur » qu'avec assez de parties pour que son taux ne soit pas du bruit.
const PARTIES_POSTE = 5;
// En deçà, un patch se lit comme du bruit, pas comme une tendance.
const PARTIES_PAR_PATCH = 3;

/** Ce que Mes stats et un joueur d'équipe ont en commun. */
export type PlayerStatsData = Pick<
  MyStatsDto,
  | "state"
  | "coverage"
  | "overall"
  | "champions"
  | "positions"
  | "queues"
  | "months"
  | "patches"
  | "rankings"
  | "references"
>;

export interface PlayerStatsViewProps {
  data: PlayerStatsData;
  /** La fiche publique montre déjà le classement en tête : une seule fois par page (Schub#93). */
  showRankings?: boolean;
}

export function PlayerStatsView({
  data,
  showRankings = true,
}: PlayerStatsViewProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { formatDate } = useLocaleFormat();
  const [choisis, setChoisis] = useState<string[]>([]);
  const [tousChampions, setTousChampions] = useState<boolean>(false);
  const overall = data.overall;

  if (data.state !== "STATISTIQUES_CONNUES" || !overall) {
    return <StatsStateNote state={data.state} variant="block" />;
  }

  const meilleurPoste = [...data.positions]
    .filter((position) => position.games >= PARTIES_POSTE)
    .sort((a, b) => (b.winRate ?? 0) - (a.winRate ?? 0))[0];
  const patchsLisibles = data.patches.filter(
    (patch) => patch.games >= PARTIES_PAR_PATCH && patch.winRate !== null,
  );
  const dernier = patchsLisibles[patchsLisibles.length - 1];
  const ecartDernier =
    dernier && overall.winRate !== null
      ? (dernier.winRate ?? 0) - overall.winRate
      : null;
  const tendance =
    ecartDernier === null || patchsLisibles.length < 2
      ? null
      : t(
          ecartDernier >= 0.05
            ? "section.trendUp"
            : ecartDernier <= -0.05
              ? "section.trendDown"
              : "section.trendStable",
          { patch: dernier.key, rate: format.taux(dernier.winRate) },
        );

  return (
    <Stack spacing={3}>
      <PlayerHighlights data={data} />

      {data.coverage && !data.coverage.tracked && (
        <Alert severity="info">{t("coverage.untracked")}</Alert>
      )}

      <GameAnalysis
        overall={overall}
        references={data.references}
        positions={data.positions}
        months={data.months}
      />

      <Columns minWidth={320}>
        <Card title={t("radar.title")}>
          <Stack spacing={1}>
            <PlayerRadar
              positions={data.positions}
              references={data.references}
            />
            <Text variant="caption" tone="secondary">
              {t("radar.helper")}
            </Text>
          </Stack>
        </Card>
        <Stack spacing={2}>
          {showRankings && (
            <Card title={t("section.rankings")}>
              <RankedStandings standings={data.rankings} />
            </Card>
          )}
          <Card title={t("section.positions")}>
            <Stack spacing={0.75}>
              {meilleurPoste && (
                <Text>
                  {t("section.bestPosition", {
                    position: format.poste(meilleurPoste.key),
                    rate: format.taux(meilleurPoste.winRate),
                    count: meilleurPoste.games,
                  })}
                </Text>
              )}
              {data.positions.map((position) => (
                <MeterBar
                  key={position.key}
                  label={format.poste(position.key)}
                  value={position.winRate}
                  valueLabel={detail(position, format)}
                  hint={
                    position.versusRest
                      ? (t("delta.versusRest", {
                          delta: format.ecartEnPoints(
                            position.versusRest.winRateDelta,
                          ),
                          count: position.versusRest.referenceGames,
                        }) ?? undefined)
                      : undefined
                  }
                />
              ))}
            </Stack>
          </Card>
        </Stack>
      </Columns>

      <Card
        title={t("section.champions")}
        actions={
          <ChampionChoice
            champions={data.champions}
            selected={choisis}
            onChange={setChoisis}
            defaultCount={CHAMPIONS_PLEINE_LARGEUR}
          />
        }
      >
        {data.champions.length === 0 ? (
          <Text variant="caption" tone="secondary">
            {t("section.noChampion")}
          </Text>
        ) : (
          <Columns minWidth={240} count={4}>
            {championsAffiches(
              data.champions,
              choisis,
              CHAMPIONS_PLEINE_LARGEUR,
            )
              .slice(
                0,
                tousChampions || choisis.length > 0
                  ? undefined
                  : CHAMPIONS_VISIBLES,
              )
              .map((line) => (
                <ChampionStatCard
                  key={line.key}
                  line={line}
                  references={data.references}
                  overall={overall}
                />
              ))}
          </Columns>
        )}
        {choisis.length === 0 &&
          data.champions.length > CHAMPIONS_VISIBLES &&
          !tousChampions && (
            <Button variant="ghost" onClick={() => setTousChampions(true)}>
              {t("section.allChampions")}
            </Button>
          )}
      </Card>

      <Columns minWidth={440} count={2}>
        <Card title={t("section.trend")}>
          {tendance && <Text>{tendance}</Text>}
          <TrendChart
            label={t("metric.winRate")}
            valueHeader={t("metric.winRate")}
            emptyLabel={t("section.noPatch")}
            scaleMax={1}
            reference={overall.winRate}
            referenceLabel={t("section.trendReference", {
              value: format.taux(overall.winRate),
            })}
            points={data.patches.map((patch) => ({
              key: patch.key,
              label: patch.key,
              value: patch.winRate,
              valueLabel: format.taux(patch.winRate),
              muted: patch.games < PARTIES_PAR_PATCH,
              title: t("section.trendPoint", {
                patch: patch.key,
                from: patch.firstPlayedAt
                  ? formatDate(new Date(patch.firstPlayedAt))
                  : format.absent,
                to: patch.lastPlayedAt
                  ? formatDate(new Date(patch.lastPlayedAt))
                  : format.absent,
                rate: format.taux(patch.winRate),
                count: patch.games,
              }),
            }))}
          />
        </Card>
        <Card title={t("section.queues")}>
          <Stack spacing={1}>
            <QueuePie queues={data.queues} label={t("queuePie.label")} />
            <Text variant="caption" tone="secondary">
              {t("section.queuesHelper")}
            </Text>
          </Stack>
        </Card>
      </Columns>
    </Stack>
  );
}

const detail = (line: StatLineDto, format: ReturnType<typeof useStatsFormat>) =>
  `${format.taux(line.winRate)} · ${line.games}`;
