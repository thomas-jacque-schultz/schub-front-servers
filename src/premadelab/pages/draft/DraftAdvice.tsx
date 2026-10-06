import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ChampionIcon,
  Columns,
  ConfidenceBadge,
  InsightCard,
  Stack,
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
            ` · ${t("draft.advice.reference", { rate: taux(combo.referenceWinRate) })}`}
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack spacing={0.75}>
      <Text variant="overline">{title}</Text>
      {children}
    </Stack>
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
        <Stack spacing={2}>
          {sections.map((section) => (
            <Section
              key={section.kind}
              title={t(`draft.advice.kind.${section.kind}`)}
            >
              {section.combos.map((combo, index) => (
                <ComboLine key={index} combo={combo} threshold={seuil(combo)} />
              ))}
            </Section>
          ))}
          {trios.length > 0 && (
            <Section title={t("draft.advice.kind.JGL_MID_SUP")}>
              {trios.map((combo, index) => (
                <ComboLine key={index} combo={combo} threshold={seuil(combo)} />
              ))}
            </Section>
          )}
          {advice.compositions.length > 0 && (
            <Section title={t("draft.advice.kind.COMPOSITION")}>
              {advice.compositions.map((combo, index) => (
                <ComboLine
                  key={index}
                  combo={combo}
                  threshold={advice.trioThreshold}
                />
              ))}
            </Section>
          )}
          {advice.avoid.length > 0 && (
            <Section title={t("draft.advice.avoid")}>
              {advice.avoid.map((combo, index) => (
                <ComboLine key={index} combo={combo} threshold={seuil(combo)} />
              ))}
            </Section>
          )}
        </Stack>
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
          {advice.toTry.map((combo, index) => (
            <ComboLine key={index} combo={combo} threshold={0} tryOut />
          ))}
        </Stack>
      }
      details={
        <Text variant="caption" tone="secondary">
          {t("draft.advice.toTryMethod")}
        </Text>
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
  const taux = useStatsFormat().taux;
  const { formatNumber } = useLocaleFormat();
  const premier = advice.bans[0];
  return (
    <InsightCard
      title={t("draft.advice.bansTitle")}
      conclusion={
        premier
          ? t("draft.advice.bansConclusion", {
              champion: premier.championName ?? "",
              rate: taux(premier.winRateAgainst),
              count: premier.gamesAgainst,
              every: Math.max(1, Math.round(1 / premier.presence)),
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
                  rate: taux(ban.winRateAgainst),
                  every: Math.max(1, Math.round(1 / ban.presence)),
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
            {t("draft.advice.bansMethod", { games: advice.games })}
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
