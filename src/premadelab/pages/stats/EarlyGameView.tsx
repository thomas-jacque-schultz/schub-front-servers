import { useTranslation } from "react-i18next";
import {
  Card,
  Chip,
  Columns,
  LaneMap,
  Stack,
  FaceOffTable,
  Text,
  Tooltip,
  type ChipTone,
} from "../../../common";
import type {
  EarlyGameDto,
  GankDto,
  GankOutcome,
  JunglePresenceDto,
  JunglerLineDto,
  Lane,
  SupportLineDto,
} from "../../types/stats";
import { useStatsFormat } from "./statsFormat";

const COULOIRS: Lane[] = ["TOP", "MID", "BOT"];

// Toujours depuis notre camp : un kill de leur jungler chez nous est rouge, le même kill par le nôtre est vert.
const TON: Record<"ours" | "theirs", Record<GankOutcome, ChipTone>> = {
  theirs: {
    KILL: "error",
    TRADE: "warning",
    SURVIVED: "success",
    COUNTER: "success",
  },
  ours: {
    KILL: "success",
    TRADE: "warning",
    SURVIVED: "neutral",
    COUNTER: "error",
  },
};

export interface EarlyGameViewProps {
  early: EarlyGameDto;
  names: Record<string, string>;
  /** Par championId : le nom du champion, pour dire de qui parle une ligne de proximité. */
  champions?: Record<number, string>;
}

export function EarlyGameView({
  early,
  names,
  champions = {},
}: EarlyGameViewProps) {
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
              <Stack
                direction="row"
                spacing={1}
                align="center"
                justify="between"
              >
                <Text variant="subtitle">{t(`early.lane.${couloir}`)}</Text>
                {couloir !== "MID" && fort !== "BALANCED" && (
                  <Chip
                    label={
                      couloir === fort ? t("early.strong") : t("early.weak")
                    }
                    tone={couloir === fort ? "primary" : "warning"}
                    variant="outline"
                    size="small"
                  />
                )}
              </Stack>
              <Venues
                title={t("early.theirs")}
                ganks={early.ganks.filter(
                  (gank) => gank.lane === couloir && !gank.ours,
                )}
                names={names}
              />
              <Venues
                title={t("early.ours")}
                ganks={early.ganks.filter(
                  (gank) => gank.lane === couloir && gank.ours,
                )}
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
      <Columns minWidth={220} count={3}>
        <Presence
          title={t("early.presence.ours")}
          presence={early.ourJungler}
        />
        <FaceOffTable
          title={t("early.objectives.title")}
          oursLabel={t("early.objectives.ours")}
          theirsLabel={t("early.objectives.theirs")}
          rows={(["dragons", "grubs", "heralds"] as const).map((cle) => ({
            key: cle,
            label: t(`early.objectives.${cle}`),
            ours: early.ourObjectives[cle],
            theirs: early.theirObjectives[cle],
          }))}
        />
        <Presence
          title={t("early.presence.theirs")}
          presence={early.theirJungler}
        />
      </Columns>
      {(early.ourSupport ||
        early.theirSupport ||
        early.ourJunglerMate ||
        early.theirJunglerMate) && (
        <>
          <Columns minWidth={260} count={2}>
            {(["ours", "theirs"] as const).map((camp) => (
              <Proximite
                key={camp}
                title={t(`early.proximity.${camp}`)}
                support={
                  camp === "ours" ? early.ourSupport : early.theirSupport
                }
                jungler={
                  camp === "ours"
                    ? early.ourJunglerMate
                    : early.theirJunglerMate
                }
                qui={(memberId, championId) =>
                  (memberId ? names[memberId] : undefined) ??
                  champions[championId] ??
                  ""
                }
              />
            ))}
          </Columns>
          <Text variant="caption" tone="secondary">
            {t("early.proximity.helper")}
          </Text>
        </>
      )}
    </Stack>
  );
}

// Schub#152 : le support avec son ADC et son jungler, le jungler et le poste dont il a été le plus proche.
function Proximite({
  title,
  support,
  jungler,
  qui,
}: {
  title: string;
  support: SupportLineDto | null;
  jungler: JunglerLineDto | null;
  qui: (memberId: string | null, championId: number) => string;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  if (!support && !jungler) {
    return null;
  }
  return (
    <Card title={title}>
      <Stack spacing={1}>
        {support && (
          <Stack spacing={0.25}>
            <Text variant="subtitle">
              {t("early.proximity.support", {
                player: qui(support.memberId, support.championId),
              })}
            </Text>
            <Text variant="body">
              {support.adcEarlyShare === null
                ? t("early.proximity.adcNone")
                : t("early.proximity.adc", {
                    share: format.taux(support.adcEarlyShare),
                    count: support.roams ?? 0,
                  })}
            </Text>
            <Text variant="body">
              {support.junglerLateShare === null
                ? t("early.proximity.junglerNone")
                : t("early.proximity.jungler", {
                    share: format.taux(support.junglerLateShare),
                  })}
            </Text>
          </Stack>
        )}
        {jungler && (
          <Stack spacing={0.25}>
            <Text variant="subtitle">
              {t("early.proximity.junglerTitle", {
                player: qui(jungler.memberId, jungler.championId),
              })}
            </Text>
            <Text variant="body">
              {t("early.proximity.closest", {
                position: format.poste(jungler.position),
                share: format.taux(jungler.share),
              })}
            </Text>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

function Venues({
  title,
  ganks,
  names,
}: {
  title: string;
  ganks: GankDto[];
  names: Record<string, string>;
}) {
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
              <Chip
                key={gank.second}
                label={label}
                tone={TON[camp][gank.outcome]}
                variant="outline"
                size="small"
              />
            );
            const morts = gank.fallenMemberIds
              .map((id) => names[id])
              .filter(Boolean);
            return morts.length > 0 ? (
              <Tooltip
                key={gank.second}
                title={t("early.fallen", { names: morts.join(", ") })}
              >
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

function Presence({
  title,
  presence,
}: {
  title: string;
  presence: JunglePresenceDto | null;
}) {
  const { t } = useTranslation("stats");
  if (!presence) {
    return null;
  }
  const minutes = (count: number) => t("early.presence.minutes", { count });
  return (
    <LaneMap
      label={title}
      align="center"
      highlight={
        presence.strongSide === "BALANCED" ? null : presence.strongSide
      }
      zones={[
        {
          key: "TOP",
          label: t("early.lane.TOP"),
          value: presence.topMinutes,
          valueLabel: minutes(presence.topMinutes),
        },
        {
          key: "MID",
          label: t("early.lane.MID"),
          value: presence.midMinutes,
          valueLabel: minutes(presence.midMinutes),
        },
        {
          key: "BOT",
          label: t("early.lane.BOT"),
          value: presence.botMinutes,
          valueLabel: minutes(presence.botMinutes),
        },
      ]}
    />
  );
}
