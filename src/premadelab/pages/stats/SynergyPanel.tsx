import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Chip,
  Columns,
  DataTable,
  Disclosure,
  Frame,
  ProgressBar,
  Stack,
  Text,
  messageOf,
  useRequest,
  type ChipTone,
} from "../../../common";
import { getTeamFindingsApi } from "../../api/findingsApi";
import { getTeamSynergyApi } from "../../api/statsApi";
import { FindingList } from "../../components/Findings";
import type { DuoDto, ResourceDto } from "../../types/stats";
import { useStatsFormat } from "./statsFormat";

// Au-delà de cinq points d'écart à l'attendu, une paire est notable.
const NOTABLE = 0.05;
// Une part de dégâts inférieure de cinq points à sa part d'or : le poste ne convertit pas.
const CONVERSION_FAIBLE = -0.05;

const ton = (delta: number | null): ChipTone =>
  delta === null
    ? "neutral"
    : delta >= NOTABLE
      ? "success"
      : delta <= -NOTABLE
        ? "warning"
        : "neutral";

const ecartDOr = (r: ResourceDto) =>
  r.winRateAbove === null || r.winRateBelow === null
    ? null
    : r.winRateAbove - r.winRateBelow;

const PRIORITE = {
  feed: "success",
  neutral: "neutral",
  starve: "warning",
} as const satisfies Record<string, ChipTone>;

const priorite = (ecart: number | null): keyof typeof PRIORITE =>
  ecart !== null && ecart >= NOTABLE
    ? "feed"
    : ecart !== null && ecart <= -NOTABLE
      ? "starve"
      : "neutral";

interface Ligne {
  id: string;
  nom: string;
}

export interface SynergyPanelProps {
  teamId: string;
  periode: string;
}

/** Les paires qui gagnent au-delà de ce qu'on attendrait d'elles, et qui reçoit l'or de l'équipe (Schub#24, #25). */
export function SynergyPanel({ teamId, periode }: SynergyPanelProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const [chiffresOuverts, setChiffresOuverts] = useState(false);
  const { data: constats } = useRequest(
    `team-findings/${teamId}/${periode}`,
    () => getTeamFindingsApi(teamId, periode),
  );
  const { data, error, isLoading } = useRequest(
    `synergy/${teamId}/${periode}`,
    () => getTeamSynergyApi(teamId, periode),
  );

  if (isLoading && !data) {
    return <ProgressBar label={t("synergy.title")} />;
  }
  if (error !== null && !data) {
    return <Alert severity="error">{messageOf(error, t("loadFailed"))}</Alert>;
  }
  if (!data) {
    return null;
  }

  const membres: Ligne[] = [];
  data.duos.forEach((d) => {
    if (!membres.some((m) => m.id === d.memberA))
      membres.push({ id: d.memberA, nom: d.nameA ?? "?" });
    if (!membres.some((m) => m.id === d.memberB))
      membres.push({ id: d.memberB, nom: d.nameB ?? "?" });
  });
  const paire = (a: string, b: string): DuoDto | undefined =>
    data.duos.find(
      (d) =>
        (d.memberA === a && d.memberB === b) ||
        (d.memberA === b && d.memberB === a),
    );
  const cellule = (a: Ligne, b: Ligne) => {
    if (a.id === b.id) return <Text tone="disabled">—</Text>;
    const duo = paire(a.id, b.id);
    if (!duo) return <Text tone="disabled">·</Text>;
    const ecart = format.ecartEnPoints(duo.delta);
    return (
      <Stack spacing={0.25} align="center">
        <Text variant="caption" tone="secondary" mono>
          {t("synergy.apart", { rate: format.taux(duo.expected) })}
        </Text>
        <Chip
          size="small"
          tone={ton(duo.delta)}
          label={
            ecart === null
              ? t("synergy.together", { rate: format.taux(duo.winRate) })
              : t("synergy.togetherDelta", {
                  rate: format.taux(duo.winRate),
                  delta: ecart,
                })
          }
        />
        <Text variant="caption" tone="secondary" mono>
          {t("synergy.games", { count: duo.games })}
        </Text>
      </Stack>
    );
  };
  const notables = data.duos.filter(
    (d) => d.delta !== null && Math.abs(d.delta) >= NOTABLE,
  );

  const classement = [...data.resources].sort(
    (x, y) => (ecartDOr(y) ?? -Infinity) - (ecartDOr(x) ?? -Infinity),
  );

  return (
    <Stack spacing={3}>
      {constats && constats.length > 0 && (
        <Card title={t("synergy.findings")}>
          <FindingList findings={constats} />
        </Card>
      )}
      <Card
        title={t("synergy.duos")}
        description={t("synergy.duosHint", { count: data.minimumDuoGames })}
      >
        {membres.length === 0 ? (
          <Text tone="secondary">
            {t("synergy.noDuo", { count: data.minimumDuoGames })}
          </Text>
        ) : (
          <Stack spacing={2}>
            <DataTable<Ligne>
              dense
              caption={t("synergy.duos")}
              emptyTitle={t("synergy.noDuo", { count: data.minimumDuoGames })}
              rows={membres}
              rowKey={(m) => m.id}
              columns={[
                { key: "nom", header: "", render: (m) => <Text>{m.nom}</Text> },
                ...membres.map((colonne) => ({
                  key: colonne.id,
                  header: colonne.nom,
                  align: "center" as const,
                  render: (ligne: Ligne) => cellule(ligne, colonne),
                })),
              ]}
            />
            {notables.map((d) => (
              <Text key={`${d.memberA}-${d.memberB}`}>
                {t(d.delta! > 0 ? "synergy.duoUp" : "synergy.duoDown", {
                  a: d.nameA,
                  b: d.nameB,
                  points: Math.round(Math.abs(d.delta!) * 100),
                  count: d.games,
                })}
              </Text>
            ))}
          </Stack>
        )}
      </Card>

      <Card
        title={t("synergy.resources")}
        description={t("synergy.resourcesHint")}
      >
        {classement.length === 0 ? (
          <Text tone="secondary">{t("synergy.noResources")}</Text>
        ) : (
          <Stack spacing={2}>
            <Columns minWidth={220} count={Math.min(classement.length, 5)}>
              {classement.map((r, rang) => (
                <PosteOr key={r.position} rang={rang + 1} ressource={r} />
              ))}
            </Columns>
            <Text variant="caption" tone="secondary">
              {t("synergy.correlation")}
            </Text>
            <Disclosure
              title={t("synergy.exact")}
              open={chiffresOuverts}
              onToggle={setChiffresOuverts}
            >
              <DataTable<ResourceDto>
                dense
                caption={t("synergy.resources")}
                emptyTitle={t("synergy.noResources")}
                rows={classement}
                rowKey={(r) => r.position}
                layout="fixed"
                minWidth={760}
                columns={[
                  {
                    key: "position",
                    header: t("synergy.position"),
                    width: 120,
                    render: (r) => format.poste(r.position),
                  },
                  ...(
                    [
                      ["goldWin", (r: ResourceDto) => r.goldShareInWins],
                      ["goldLoss", (r: ResourceDto) => r.goldShareInLosses],
                      ["damageWin", (r: ResourceDto) => r.damageShareInWins],
                      ["damageLoss", (r: ResourceDto) => r.damageShareInLosses],
                    ] as const
                  ).map(([cle, part]) => ({
                    key: cle,
                    header: t(`synergy.share.${cle}`),
                    width: 130,
                    align: "right" as const,
                    render: (r: ResourceDto) => format.taux(part(r)),
                  })),
                  {
                    key: "conversion",
                    header: t("synergy.conversion"),
                    width: 120,
                    align: "right",
                    render: (r) => (
                      <Chip
                        size="small"
                        tone={
                          r.conversion !== null &&
                          r.conversion <= CONVERSION_FAIBLE
                            ? "warning"
                            : "neutral"
                        }
                        label={format.ecartEnPoints(r.conversion) ?? "—"}
                      />
                    ),
                  },
                ]}
              />
            </Disclosure>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

function PosteOr({
  rang,
  ressource: r,
}: {
  rang: number;
  ressource: ResourceDto;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const ecart = ecartDOr(r);
  const niveau = priorite(ecart);
  return (
    <Frame>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} align="center" justify="between">
          <Text variant="subtitle">
            {t("synergy.rank", {
              rank: rang,
              position: format.poste(r.position),
            })}
          </Text>
          <Text variant="caption" mono>
            {format.ecartEnPoints(ecart) ?? format.absent}
          </Text>
        </Stack>
        <Chip
          size="small"
          tone={PRIORITE[niveau]}
          label={t(`synergy.priority.${niveau}`)}
        />
        {r.goldShareThreshold === null ? (
          <Text variant="caption" tone="secondary">
            {t("synergy.noSplit")}
          </Text>
        ) : (
          <>
            <Text variant="caption">
              {t("synergy.above", {
                threshold: format.taux(r.goldShareThreshold),
                rate: format.taux(r.winRateAbove),
                count: r.gamesAbove,
              })}
            </Text>
            <Text variant="caption">
              {t("synergy.below", {
                rate: format.taux(r.winRateBelow),
                count: r.gamesBelow,
              })}
            </Text>
          </>
        )}
        {r.conversion !== null && r.conversion <= CONVERSION_FAIBLE && (
          <Text variant="caption" tone="secondary">
            {t("synergy.notConverting")}
          </Text>
        )}
      </Stack>
    </Frame>
  );
}
