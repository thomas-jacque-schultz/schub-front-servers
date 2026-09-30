import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Chip,
  Expandable,
  Icon,
  MeterBar,
  Stack,
  Text,
  Tooltip,
  useCurrentLanguage,
  type ChipTone,
} from "../../common";
import { useStatsFormat } from "../pages/stats/statsFormat";
import { useFindingSentence } from "./findingSentence";
import type {
  ConditionTraceDto,
  FindingDto,
  FindingPolarity,
} from "../types/findings";

const TON: Record<FindingPolarity, ChipTone> = {
  STRENGTH: "success",
  WEAKNESS: "warning",
  NEUTRAL: "secondary",
};

function Evidence({ condition }: { condition: ConditionTraceDto }) {
  const { t } = useTranslation("lol");
  const format = useStatsFormat();
  const observe =
    condition.observed === null
      ? t("findings.absent")
      : condition.unit === "PERCENTILE"
        ? t("findings.percentile", { value: format.entier(condition.observed) })
        : format.ratio(condition.observed);
  return (
    <MeterBar
      value={condition.degree}
      label={`${t(`findings.role.${condition.role}`)} · ${condition.signal.replace(/^pattern:/, "")}`}
      valueLabel={observe}
      hint={t("findings.ramp", {
        from: format.ratio(condition.from),
        to: format.ratio(condition.to),
      })}
    />
  );
}

export interface FindingListProps {
  findings: FindingDto[];
  /** Dépliables sur leur preuve : règle, conditions, valeurs observées, degrés. */
  withEvidence?: boolean;
}

export function FindingList({
  findings,
  withEvidence = true,
}: FindingListProps) {
  const { t } = useTranslation("lol");
  const langue = useCurrentLanguage();
  const phrase = useFindingSentence();
  const [ouvert, setOuvert] = useState<string | null>(null);

  if (findings.length === 0) {
    return <Text tone="secondary">{t("findings.none")}</Text>;
  }

  return (
    <Stack spacing={1.5}>
      {findings.map((finding) => {
        const entete = (
          <Stack direction="row" spacing={1} align="center" wrap>
            <Chip
              size="small"
              tone={TON[finding.polarity]}
              label={
                finding.label[langue] ?? finding.label.fr ?? finding.pattern
              }
            />
            {finding.experimental && (
              <Tooltip
                title={
                  finding.limits[langue] ??
                  finding.limits.fr ??
                  t("findings.experimentalHint")
                }
              >
                <Chip
                  size="small"
                  variant="outline"
                  icon={<Icon name="science" size="small" />}
                  label={t("findings.experimental")}
                />
              </Tooltip>
            )}
            <Text>{phrase(finding)}</Text>
          </Stack>
        );
        if (!withEvidence) {
          return <div key={finding.pattern}>{entete}</div>;
        }
        return (
          <Expandable
            key={finding.pattern}
            summary={entete}
            open={ouvert === finding.pattern}
            onToggle={(open) => setOuvert(open ? finding.pattern : null)}
          >
            <Stack spacing={1.5}>
              <Text variant="caption" tone="secondary">
                {t("findings.confidence", {
                  value: Math.round(finding.confidence * 100),
                })}
              </Text>
              {finding.evidence.map((condition, index) => (
                <Evidence
                  key={`${condition.signal}-${index}`}
                  condition={condition}
                />
              ))}
            </Stack>
          </Expandable>
        );
      })}
    </Stack>
  );
}
