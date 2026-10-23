import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ChampionIcon,
  Columns,
  ConfidenceBadge,
  DataTable,
  InsightCard,
  Stack,
  Tabs,
  Text,
  useLocaleFormat,
} from "../../../common";
import type {
  BanDto,
  ComboDto,
  ComboKind,
  DraftAdviceDto,
} from "../../types/draft";
import { useStatsFormat } from "../stats/statsFormat";

const DUOS: ComboKind[] = ["JGL_TOP", "JGL_MID", "JGL_SUP", "ADC_SUP"];
const RETENUS = 3;

/** Une ligne de combo : les joueurs et leurs champions, notre bilan, le repère général. */
function ComboLine({
  combo,
  threshold,
  tryOut = false,
}: {
  combo: ComboDto;
  threshold: number;
  tryOut?: boolean;
}) {
  const { t } = useTranslation("teams");
  const taux = useStatsFormat().taux;
  const picks = combo.picks
    .map((pick) =>
      t("draft.advice.pick", {
        player: pick.memberName ?? "—",
        champion: pick.championName ?? pick.championKey ?? "",
      }),
    )
    .join(" + ");
  return (
    <Stack direction="row" spacing={1} align="center" wrap>
      <Stack direction="row" spacing={0.5}>
        {combo.picks.map((pick, index) => (
          <ChampionIcon
            key={`${pick.championId}-${index}`}
            size="small"
            name={pick.championName ?? String(pick.championId)}
            src={pick.iconUrl}
          />
        ))}
      </Stack>
      <Text>{picks}</Text>
      {tryOut ? (
        <Text variant="caption" tone="secondary">
          {t("draft.advice.tryLine", {
            rate: taux(combo.referenceWinRate ?? 0),
            count: combo.games,
          })}
        </Text>
      ) : (
        <Text variant="caption" mono>
          {t("draft.advice.record", {
            wins: combo.wins,
            losses: combo.games - combo.wins,
          })}
          {combo.referenceWinRate !== null &&
            ` · ${t("draft.advice.reference", {
              rate: taux(combo.referenceWinRate),
              count: combo.referenceGames ?? 0,
            })}`}
        </Text>
      )}
      {!tryOut && combo.lowConfidence && (
        <ConfidenceBadge
          label={t("draft.advice.lowConfidence")}
          title={t("draft.advice.lowConfidenceHint", {
            count: combo.games,
            threshold,
          })}
        />
      )}
    </Stack>
  );
}

const cleDe = (combo: ComboDto) =>
  combo.picks.map((pick) => `${pick.memberId}:${pick.championId}`).join("|");

/** Les combos d'un onglet, en colonnes alignées : champions, joueurs, bilan, repère général. */
function ComboTable({
  combos,
  threshold,
}: {
  combos: ComboDto[];
  threshold: (combo: ComboDto) => number;
}) {
  const { t } = useTranslation("teams");
  const taux = useStatsFormat().taux;
  const icones = Math.max(...combos.map((combo) => combo.picks.length));
  return (
    <DataTable<ComboDto>
      dense
      layout="fixed"
      minWidth={560}
      caption={t("draft.advice.combosTitle")}
      emptyTitle={t("draft.advice.combosEmpty")}
      rows={combos}
      rowKey={cleDe}
      columns={[
        {
          key: "champions",
          header: "",
          width: 30 * icones + 8,
          render: (combo) => (
            <Stack direction="row" spacing={0.5}>
              {combo.picks.map((pick, index) => (
                <ChampionIcon
                  key={`${pick.championId}-${index}`}
                  size="small"
                  name={pick.championName ?? String(pick.championId)}
                  src={pick.iconUrl}
                />
              ))}
            </Stack>
          ),
        },
        {
          key: "players",
          header: t("draft.advice.columns.players"),
          render: (combo) => (
            <Stack spacing={0}>
              {combo.picks.map((pick, index) => (
                <Text key={index} variant="caption">
                  {t("draft.advice.pick", {
                    player: pick.memberName ?? "—",
                    champion: pick.championName ?? pick.championKey ?? "",
                  })}
                </Text>
              ))}
            </Stack>
          ),
        },
        {
          key: "record",
          header: t("draft.advice.columns.record"),
          width: 150,
          align: "right",
          render: (combo) => (
            <Stack direction="row" spacing={0.5} align="center" justify="end">
              {combo.lowConfidence && (
                <ConfidenceBadge
                  label={t("draft.advice.lowConfidence")}
                  title={t("draft.advice.lowConfidenceHint", {
                    count: combo.games,
                    threshold: threshold(combo),
                  })}
                />
              )}
              <Text mono>
                {t("draft.advice.record", {
                  wins: combo.wins,
                  losses: combo.games - combo.wins,
                })}
              </Text>
            </Stack>
          ),
        },
        {
          key: "reference",
          header: t("draft.advice.columns.reference"),
          width: 140,
          align: "right",
          render: (combo) =>
            combo.referenceWinRate === null ? (
              <Text tone="disabled">—</Text>
            ) : (
              <Text variant="caption" tone="secondary" mono>
                {t("draft.advice.referenceShort", {
                  rate: taux(combo.referenceWinRate),
                  count: combo.referenceGames ?? 0,
                })}
              </Text>
            ),
        },
      ]}
    />
  );
}

/** #105 : nos combos (joueur, poste, champion) ; la synergie générale n'est qu'un repère sur la ligne. */
export function CombosCard({ advice }: { advice: DraftAdviceDto }) {
  const { t } = useTranslation("teams");
  const taux = useStatsFormat().taux;
  const seuil = (combo: ComboDto) =>
    combo.picks.length > 2 ? advice.trioThreshold : advice.duoThreshold;
  const meilleur = [...advice.duos, ...advice.trios].sort(
    (a, b) => b.lowerBound - a.lowerBound,
  )[0];
  const sections = DUOS.map((kind) => ({
    kind,
    combos: advice.duos
      .filter((combo) => combo.kind === kind)
      .slice(0, RETENUS),
  })).filter((section) => section.combos.length > 0);
  const trios = advice.trios.slice(0, RETENUS);
  const onglets = [
    ...sections.map((section) => ({
      key: section.kind,
      label: t(`draft.advice.kindShort.${section.kind}`),
      combos: section.combos,
    })),
    {
      key: "JGL_MID_SUP",
      label: t("draft.advice.kindShort.JGL_MID_SUP"),
      combos: trios,
    },
    {
      key: "COMPOSITION",
      label: t("draft.advice.kindShort.COMPOSITION"),
      combos: advice.compositions,
    },
    { key: "AVOID", label: t("draft.advice.avoid"), combos: advice.avoid },
  ].filter((onglet) => onglet.combos.length > 0);
  const [choisi, setChoisi] = useState<string | null>(null);
  const courant = onglets.find((onglet) => onglet.key === choisi) ?? onglets[0];
  const seuilDe = (combo: ComboDto) =>
    courant?.key === "COMPOSITION" ? advice.trioThreshold : seuil(combo);

  return (
    <InsightCard
      title={t("draft.advice.combosTitle")}
      conclusion={
        meilleur
          ? t("draft.advice.combosConclusion", {
              picks: meilleur.picks
                .map((pick) =>
                  t("draft.advice.pick", {
                    player: pick.memberName ?? "—",
                    champion: pick.championName ?? "",
                  }),
                )
                .join(" + "),
              wins: meilleur.wins,
              losses: meilleur.games - meilleur.wins,
            })
          : t("draft.advice.combosEmpty")
      }
      verdict={meilleur ? "above" : undefined}
      visual={
        courant && (
          <Tabs
            items={onglets.map((onglet) => ({
              key: onglet.key,
              label: onglet.label,
            }))}
            value={courant.key}
            onChange={setChoisi}
            ariaLabel={t("draft.advice.combosTitle")}
          >
            <ComboTable combos={courant.combos} threshold={seuilDe} />
          </Tabs>
        )
      }
      details={
        <Stack spacing={0.75}>
          {[...sections.flatMap((s) => s.combos), ...trios]
            .filter((combo) => combo.expected !== null)
            .map((combo, index) => (
              <Text key={index} variant="caption">
                {t("draft.advice.expected", {
                  picks: combo.picks.map((p) => p.championName).join(" + "),
                  rate: taux(combo.winRate),
                  expected: taux(combo.expected ?? 0),
                })}
              </Text>
            ))}
          <Text variant="caption" tone="secondary">
            {t("draft.advice.combosMethod", {
              games: advice.games,
              duo: advice.duoThreshold,
              trio: advice.trioThreshold,
            })}
          </Text>
        </Stack>
      }
      detailsLabel={t("draft.advice.details")}
      hideDetailsLabel={t("draft.advice.hideDetails")}
    />
  );
}

/** #108 : forts en général, dans le pool ou l'historique de chacun, et presque jamais joués ensemble. */
export function ToTryCard({ advice }: { advice: DraftAdviceDto }) {
  const { t } = useTranslation("teams");
  const taux = useStatsFormat().taux;
  if (advice.toTry.length === 0) {
    return null;
  }
  const premier = advice.toTry[0];
  return (
    <InsightCard
      title={t("draft.advice.toTryTitle")}
      conclusion={t("draft.advice.toTryConclusion", {
        picks: premier.picks
          .map((pick) =>
            t("draft.advice.pick", {
              player: pick.memberName ?? "—",
              champion: pick.championName ?? "",
            }),
          )
          .join(" + "),
        rate: taux(premier.referenceWinRate ?? 0),
      })}
      visual={
        <Stack spacing={0.75}>
          {advice.toTry.slice(0, RETENUS).map((combo, index) => (
            <ComboLine key={index} combo={combo} threshold={0} tryOut />
          ))}
        </Stack>
      }
      details={
        <Stack spacing={0.75}>
          {advice.toTry.slice(RETENUS).map((combo, index) => (
            <ComboLine key={index} combo={combo} threshold={0} tryOut />
          ))}
          <Text variant="caption" tone="secondary">
            {t("draft.advice.toTryMethod")}
          </Text>
        </Stack>
      }
      detailsLabel={t("draft.advice.details")}
      hideDetailsLabel={t("draft.advice.hideDetails")}
    />
  );
}

/** #106 : classés par impact = présence × perte de taux de victoire. */
export function BansCard({
  advice,
  onPick,
}: {
  advice: DraftAdviceDto;
  /** Dans l'éditeur : un ban conseillé se choisit en un clic. */
  onPick?: (ban: BanDto) => void;
}) {
  const { t } = useTranslation("teams");
  const { formatNumber } = useLocaleFormat();
  const premier = advice.bans[0];
  return (
    <InsightCard
      title={t("draft.advice.bansTitle")}
      conclusion={
        premier
          ? t("draft.advice.bansConclusion", {
              champion: premier.championName ?? "",
              wins: premier.winsAgainst,
              losses: premier.gamesAgainst - premier.winsAgainst,
              count: premier.gamesAgainst,
            })
          : t("draft.advice.bansEmpty")
      }
      verdict={premier ? "below" : undefined}
      visual={
        <Stack spacing={0.75}>
          {advice.bans.map((ban) => (
            <Stack
              key={ban.championId}
              direction="row"
              spacing={1}
              align="center"
              wrap
            >
              <ChampionIcon
                size="small"
                name={ban.championName ?? String(ban.championId)}
                src={ban.iconUrl}
              />
              <Text>{ban.championName}</Text>
              <Text variant="caption" mono>
                {t("draft.advice.banLine", {
                  wins: ban.winsAgainst,
                  losses: ban.gamesAgainst - ban.winsAgainst,
                  count: ban.gamesAgainst,
                  games: advice.games,
                })}
              </Text>
              {ban.lowConfidence && (
                <ConfidenceBadge
                  label={t("draft.advice.lowConfidence")}
                  title={t("draft.advice.lowConfidenceHint", {
                    count: ban.gamesAgainst,
                    threshold: advice.duoThreshold,
                  })}
                />
              )}
              {onPick && ban.championKey && (
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => onPick(ban)}
                >
                  {t("draft.advice.banAdd")}
                </Button>
              )}
            </Stack>
          ))}
        </Stack>
      }
      details={
        <Stack spacing={0.75}>
          {advice.laneThreats.map((menace) => (
            <Text
              key={`${menace.memberId}-${menace.championId}`}
              variant="caption"
            >
              {t("draft.advice.laneThreat", {
                champion: menace.championName ?? "",
                player: menace.memberName ?? "—",
                gold: formatNumber(Math.round(Math.abs(menace.goldDiffAt15))),
                count: menace.games,
              })}
            </Text>
          ))}
          <Text variant="caption" tone="secondary">
            {t("draft.advice.bansMethod", {
              games: advice.games,
              duo: advice.duoThreshold,
            })}
          </Text>
        </Stack>
      }
      detailsLabel={t("draft.advice.details")}
      hideDetailsLabel={t("draft.advice.hideDetails")}
    />
  );
}

export function DraftAdviceCards({ advice }: { advice: DraftAdviceDto }) {
  return (
    <Stack spacing={2}>
      <Columns minWidth={360} count={2}>
        <CombosCard advice={advice} />
        <BansCard advice={advice} />
      </Columns>
      <ToTryCard advice={advice} />
    </Stack>
  );
}
