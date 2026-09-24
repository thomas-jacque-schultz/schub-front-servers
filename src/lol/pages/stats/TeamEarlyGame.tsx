import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Card, DataTable, type DataTableColumn, SplitBar, Stack, Text } from "../../../design-system";
import type { MemberEarlyDto, StrongSideRecordDto, TeamEarlyGameDto } from "../../types/stats";
import { useStatsFormat } from "./statsFormat";

export function TeamEarlyGame({ early }: { early: TeamEarlyGameDto | null }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();

  if (!early || early.games === 0) {
    return (
      <Card>
        <Text variant="caption" tone="secondary">
          {t("early.team.none")}
        </Text>
      </Card>
    );
  }

  const nom = (membre: MemberEarlyDto) => membre.displayName ?? t("player.unnamed");
  const taux = (part: number, total: number) => (total === 0 ? format.absent : format.taux(part / total));
  const parPartie = (valeur: number, parties: number) =>
    parties === 0 ? format.absent : format.ratio(valeur / parties);

  const laners: Array<DataTableColumn<MemberEarlyDto>> = [
    { key: "member", header: t("early.team.member"), width: 180, render: nom },
    { key: "games", header: t("early.team.laneGames"), width: 90, align: "right", render: (m) => format.entier(m.laneGames) },
    {
      key: "faced",
      header: t("early.team.facedPerGame"),
      width: 130,
      align: "right",
      render: (m) => parPartie(m.ganksFaced, m.laneGames),
    },
    { key: "held", header: t("early.team.held"), width: 110, align: "right", render: (m) => taux(m.ganksHeld, m.ganksFaced) },
    { key: "deaths", header: t("early.team.deaths"), width: 140, align: "right", render: (m) => format.entier(m.deathsOnGank) },
  ];

  const junglers: Array<DataTableColumn<MemberEarlyDto>> = [
    { key: "member", header: t("early.team.member"), width: 180, render: nom },
    { key: "games", header: t("early.team.jungleGames"), width: 90, align: "right", render: (m) => format.entier(m.jungleGames) },
    {
      key: "made",
      header: t("early.team.madePerGame"),
      width: 130,
      align: "right",
      render: (m) => parPartie(m.ganksMade, m.jungleGames),
    },
    {
      key: "decisive",
      header: t("early.team.decisive"),
      width: 110,
      align: "right",
      render: (m) => taux(m.ganksDecisive, m.ganksMade),
    },
    {
      key: "countered",
      header: t("early.team.countered"),
      width: 110,
      align: "right",
      render: (m) => format.entier(m.ganksCountered),
    },
    {
      key: "presence",
      header: t("early.team.presence"),
      width: 260,
      render: (m) => (
        <SplitBar
          label={t("early.team.presence")}
          highlight={coteFort(m)}
          segments={(["TOP", "MID", "BOT"] as const).map((cote) => {
            const minutes = cote === "TOP" ? m.topMinutes : cote === "MID" ? m.midMinutes : m.botMinutes;
            const total = m.topMinutes + m.midMinutes + m.botMinutes;
            return {
              key: cote,
              label: t(`early.lane.${cote}`),
              value: minutes,
              valueLabel: total === 0 ? format.absent : format.taux(minutes / total),
            };
          })}
        />
      ),
    },
  ];

  const cotes: Array<DataTableColumn<StrongSideRecordDto>> = [
    { key: "side", header: t("early.team.side"), width: 160, render: (c) => t(`early.side.${c.side}`) },
    { key: "games", header: t("early.team.games"), width: 90, align: "right", render: (c) => format.entier(c.games) },
    { key: "wins", header: t("early.team.winRate"), width: 110, align: "right", render: (c) => taux(c.wins, c.games) },
    {
      key: "weak",
      header: t("early.team.onWeakSide"),
      width: 220,
      align: "right",
      render: (c) =>
        c.side === "BALANCED"
          ? format.absent
          : `${taux(c.enemyGanksOnWeakSide, c.enemyGanks)} · ${c.enemyGanksOnWeakSide}/${c.enemyGanks}`,
    },
  ];

  return (
    <Card description={t("early.team.helper", { count: early.games })}>
      <Stack spacing={2.5}>
        <Section titre={t("early.team.laners")} aide={t("early.team.lanersHelper")}>
          <DataTable
            columns={laners}
            rows={early.members.filter((m) => m.laneGames > 0)}
            rowKey={(m) => m.memberId}
            caption={t("early.team.laners")}
            emptyTitle={t("early.team.none")}
            dense
            layout="fixed"
            minWidth={650}
          />
        </Section>
        <Section titre={t("early.team.junglers")} aide={t("early.team.junglersHelper")}>
          <DataTable
            columns={junglers}
            rows={early.members.filter((m) => m.jungleGames > 0)}
            rowKey={(m) => m.memberId}
            caption={t("early.team.junglers")}
            emptyTitle={t("early.team.none")}
            dense
            layout="fixed"
            minWidth={880}
          />
        </Section>
        <Section titre={t("early.team.sides")} aide={t("early.team.sidesHelper")}>
          <DataTable
            columns={cotes}
            rows={early.strongSides}
            rowKey={(c) => c.side}
            caption={t("early.team.sides")}
            emptyTitle={t("early.team.none")}
            dense
            layout="fixed"
            minWidth={580}
          />
        </Section>
      </Stack>
    </Card>
  );
}

// Même règle que le cœur pour une partie — deux minutes d'écart — rapportée au nombre de parties.
const coteFort = (m: MemberEarlyDto) =>
  m.topMinutes >= m.botMinutes + 2 * m.jungleGames ? "TOP" : m.botMinutes >= m.topMinutes + 2 * m.jungleGames ? "BOT" : null;

function Section({ titre, aide, children }: { titre: string; aide: string; children: ReactNode }) {
  return (
    <Stack spacing={0.75}>
      <Text variant="subtitle">{titre}</Text>
      <Text variant="caption" tone="secondary">
        {aide}
      </Text>
      {children}
    </Stack>
  );
}
