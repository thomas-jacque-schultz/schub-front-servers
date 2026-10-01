import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Columns,
  DataTable,
  LaneMap,
  MeterBar,
  Stack,
  Text,
  type DataTableColumn,
} from "../../../common";
import type {
  MemberEarlyDto,
  StrongSideRecordDto,
  TeamEarlyGameDto,
} from "../../types/stats";
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

  const nom = (membre: MemberEarlyDto) =>
    membre.displayName ?? t("player.unnamed");
  const taux = (part: number, total: number) =>
    total === 0 ? format.absent : format.taux(part / total);
  const parPartie = (valeur: number, parties: number) =>
    parties === 0 ? format.absent : format.ratio(valeur / parties);

  const laners: Array<DataTableColumn<MemberEarlyDto>> = [
    { key: "member", header: t("early.team.member"), width: 180, render: nom },
    {
      key: "games",
      header: t("early.team.laneGames"),
      width: 90,
      align: "right",
      render: (m) => format.entier(m.laneGames),
    },
    {
      key: "faced",
      header: t("early.team.facedPerGame"),
      width: 130,
      align: "right",
      render: (m) => parPartie(m.ganksFaced, m.laneGames),
    },
    {
      key: "held",
      header: t("early.team.held"),
      width: 110,
      align: "right",
      render: (m) => taux(m.ganksHeld, m.ganksFaced),
    },
    {
      key: "deaths",
      header: t("early.team.deathsPerGame"),
      width: 160,
      align: "right",
      render: (m) => parPartie(m.deathsOnGank, m.laneGames),
    },
  ];

  const junglers: Array<DataTableColumn<MemberEarlyDto>> = [
    { key: "member", header: t("early.team.member"), width: 180, render: nom },
    {
      key: "games",
      header: t("early.team.jungleGames"),
      width: 90,
      align: "right",
      render: (m) => format.entier(m.jungleGames),
    },
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
      header: t("early.team.presenceWith"),
      width: 300,
      render: (m) =>
        m.presenceWith.length === 0 ? (
          format.absent
        ) : (
          <Stack spacing={0.75}>
            {[...m.presenceWith]
              .sort((a, b) => b.games - a.games)
              .map((p) => (
                <MeterBar
                  key={p.memberId}
                  label={p.displayName ?? t("player.unnamed")}
                  value={
                    p.totalMinutes === 0 ? null : p.minutes / p.totalMinutes
                  }
                  valueLabel={`${taux(p.minutes, p.totalMinutes)} · ${t("synergy.games", { count: p.games })}`}
                />
              ))}
          </Stack>
        ),
    },
  ];

  const cotes: Array<DataTableColumn<StrongSideRecordDto>> = [
    {
      key: "side",
      header: t("early.team.side"),
      width: 120,
      render: (c) => t(`early.side.${c.side}`),
    },
    {
      key: "games",
      header: t("early.team.games"),
      width: 80,
      align: "right",
      render: (c) => format.entier(c.games),
    },
    {
      key: "wins",
      header: t("early.team.winRate"),
      width: 100,
      align: "right",
      render: (c) => taux(c.wins, c.games),
    },
    {
      key: "weak",
      header: t("early.team.onWeakSide"),
      width: 190,
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
        <Section
          titre={t("early.team.laners")}
          aide={t("early.team.lanersHelper")}
        >
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
        <Section
          titre={t("early.team.junglers")}
          aide={t("early.team.junglersHelper")}
        >
          <DataTable
            columns={junglers}
            rows={early.members.filter((m) => m.jungleGames > 0)}
            rowKey={(m) => m.memberId}
            caption={t("early.team.junglers")}
            emptyTitle={t("early.team.none")}
            dense
            layout="fixed"
            minWidth={920}
          />
        </Section>
        <Section
          titre={t("early.team.sides")}
          aide={t("early.team.sidesHelper")}
        >
          <Columns minWidth={300} count={2}>
            <SidesMap sides={early.strongSides} />
            <DataTable
              columns={cotes}
              rows={early.strongSides}
              rowKey={(c) => c.side}
              caption={t("early.team.sides")}
              emptyTitle={t("early.team.none")}
              dense
              layout="fixed"
              minWidth={490}
            />
          </Columns>
        </Section>
      </Stack>
    </Card>
  );
}

// En deçà, un couloir reste gris : trop peu de parties pour le comparer.
const PARTIES_PAR_COTE = 3;
// L'écart qui sature la teinte : 20 points au-dessus ou en dessous de la moyenne.
const ECART_SATURE = 0.2;
const ECART_NEUTRE = 0.03;
const ZONE_DU_COTE = { TOP: "TOP", BALANCED: "MID", BOT: "BOT" } as const;

function SidesMap({ sides }: { sides: StrongSideRecordDto[] }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const parties = sides.reduce((somme, c) => somme + c.games, 0);
  const victoires = sides.reduce((somme, c) => somme + c.wins, 0);
  const moyenne = parties > 0 ? victoires / parties : null;
  const lisibles = sides.filter((c) => c.games >= PARTIES_PAR_COTE);
  const meilleur = [...lisibles].sort(
    (a, b) => b.wins / b.games - a.wins / a.games,
  )[0];
  return (
    <LaneMap
      label={t("early.team.sidesMap", {
        average: format.taux(moyenne),
      })}
      highlight={
        meilleur && lisibles.length > 1 ? ZONE_DU_COTE[meilleur.side] : null
      }
      zones={(["TOP", "BALANCED", "BOT"] as const).map((cote) => {
        const ligne = sides.find((c) => c.side === cote);
        const games = ligne?.games ?? 0;
        const taux = ligne && games > 0 ? ligne.wins / games : null;
        const ecart = taux !== null && moyenne !== null ? taux - moyenne : 0;
        return {
          key: ZONE_DU_COTE[cote],
          label: t(`early.team.sideZone.${cote}`),
          value: games,
          valueLabel:
            games < PARTIES_PAR_COTE
              ? `${format.absent} · ${games}`
              : `${format.taux(taux)} · ${games}`,
          tone:
            games < PARTIES_PAR_COTE
              ? "empty"
              : ecart > ECART_NEUTRE
                ? "positive"
                : ecart < -ECART_NEUTRE
                  ? "negative"
                  : "neutral",
          strength: Math.abs(ecart) / ECART_SATURE,
        };
      })}
    />
  );
}

function Section({
  titre,
  aide,
  children,
}: {
  titre: string;
  aide: string;
  children: ReactNode;
}) {
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
