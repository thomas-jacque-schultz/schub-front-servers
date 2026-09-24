import { useTranslation } from "react-i18next";
import {
  Card,
  Chip,
  type ChipTone,
  Columns,
  SplitBar,
  Stack,
  StatGrid,
  Text,
  Tooltip,
} from "../../../design-system";
import type { EarlyGameDto, GankDto, GankOutcome, JunglePresenceDto, Lane } from "../../types/stats";
import { useStatsFormat } from "./statsFormat";

const COULOIRS: Lane[] = ["TOP", "MID", "BOT"];

// Toujours depuis notre camp : un kill de leur jungler chez nous est rouge, le même kill par le nôtre est vert.
const TON: Record<"ours" | "theirs", Record<GankOutcome, ChipTone>> = {
  theirs: { KILL: "error", TRADE: "warning", SURVIVED: "success", COUNTER: "success" },
  ours: { KILL: "success", TRADE: "warning", SURVIVED: "neutral", COUNTER: "error" },
};

export interface EarlyGameViewProps {
  early: EarlyGameDto;
  names: Record<string, string>;
}

export function EarlyGameView({ early, names }: EarlyGameViewProps) {
  const { t } = useTranslation("stats");
  const fort = early.ourJungler?.strongSide ?? "BALANCED";
  const adverses = early.ganks.filter((gank) => !gank.ours);
  const faible = fort === "TOP" ? "BOT" : fort === "BOT" ? "TOP" : null;

  return (
    <Stack spacing={1.5}>
      <Text variant="section">{t("early.title")}</Text>
      <Text variant="caption" tone="secondary">
        {t("early.helper")}
      </Text>
      <Columns minWidth={220} count={3}>
        {COULOIRS.map((couloir) => (
          <Card key={couloir}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} align="center" justify="between">
                <Text variant="subtitle">{t(`early.lane.${couloir}`)}</Text>
                {couloir !== "MID" && fort !== "BALANCED" && (
                  <Chip
                    label={couloir === fort ? t("early.strong") : t("early.weak")}
                    tone={couloir === fort ? "primary" : "warning"}
                    variant="outline"
                    size="small"
                  />
                )}
              </Stack>
              <Venues
                title={t("early.theirs")}
                ganks={early.ganks.filter((gank) => gank.lane === couloir && !gank.ours)}
                names={names}
              />
              <Venues
                title={t("early.ours")}
                ganks={early.ganks.filter((gank) => gank.lane === couloir && gank.ours)}
                names={names}
              />
            </Stack>
          </Card>
        ))}
      </Columns>
      <Text variant="caption" tone="secondary">
        {faible
          ? t("early.weakSummary", {
              side: t(`early.side.${fort}`),
              onWeak: adverses.filter((gank) => gank.lane === faible).length,
              total: adverses.length,
            })
          : t("early.balancedSummary")}
      </Text>
      <Columns minWidth={240} count={3}>
        <Presence title={t("early.presence.ours")} presence={early.ourJungler} />
        <Presence title={t("early.presence.theirs")} presence={early.theirJungler} />
        <Stack spacing={0.5}>
          <Text variant="caption" tone="secondary">
            {t("early.objectives.title")}
          </Text>
          <StatGrid
            size="small"
            minWidth={70}
            items={(["dragons", "grubs", "heralds"] as const).map((cle) => ({
              key: cle,
              label: t(`early.objectives.${cle}`),
              value: `${early.ourObjectives[cle]} – ${early.theirObjectives[cle]}`,
            }))}
          />
        </Stack>
      </Columns>
    </Stack>
  );
}

function Venues({ title, ganks, names }: { title: string; ganks: GankDto[]; names: Record<string, string> }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  return (
    <Stack spacing={0.5}>
      <Text variant="caption" tone="secondary">
        {title}
      </Text>
      {ganks.length === 0 ? (
        <Text variant="caption" tone="disabled">
          {t("early.none")}
        </Text>
      ) : (
        <Stack direction="row" spacing={0.5} wrap>
          {ganks.map((gank) => {
            const camp = gank.ours ? "ours" : "theirs";
            const label = [
              `${format.horloge(gank.second)} ${t(`early.verdict.${camp}.${gank.outcome}`)}`,
              ...(gank.ours && gank.decisive ? [t("early.decisive")] : []),
              ...(gank.objectiveFollowUp ? [t("early.objective")] : []),
            ].join(" · ");
            const chip = (
              <Chip key={gank.second} label={label} tone={TON[camp][gank.outcome]} variant="outline" size="small" />
            );
            const morts = gank.fallenMemberIds.map((id) => names[id]).filter(Boolean);
            return morts.length > 0 ? (
              <Tooltip key={gank.second} title={t("early.fallen", { names: morts.join(", ") })}>
                {chip}
              </Tooltip>
            ) : (
              chip
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

function Presence({ title, presence }: { title: string; presence: JunglePresenceDto | null }) {
  const { t } = useTranslation("stats");
  if (!presence) {
    return null;
  }
  const minutes = (count: number) => t("early.presence.minutes", { count });
  return (
    <SplitBar
      label={title}
      highlight={presence.strongSide === "BALANCED" ? null : presence.strongSide}
      segments={[
        { key: "TOP", label: t("early.lane.TOP"), value: presence.topMinutes, valueLabel: minutes(presence.topMinutes) },
        { key: "MID", label: t("early.lane.MID"), value: presence.midMinutes, valueLabel: minutes(presence.midMinutes) },
        { key: "BOT", label: t("early.lane.BOT"), value: presence.botMinutes, valueLabel: minutes(presence.botMinutes) },
      ]}
    />
  );
}
