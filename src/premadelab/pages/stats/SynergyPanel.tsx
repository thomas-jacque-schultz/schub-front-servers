import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Chip,
  DataTable,
  ProgressBar,
  Stack,
  Text,
  messageOf,
  useRequest,
  type ChipTone,
} from "../../../common";
import { getTeamSynergyApi } from "../../api/statsApi";
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
    return (
      <Stack spacing={0} align="center">
        <Chip
          size="small"
          tone={ton(duo.delta)}
          label={
            duo.delta === null
              ? format.taux(duo.winRate)
              : (format.ecartEnPoints(duo.delta) ?? "—")
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

  const phraseRessource = (r: ResourceDto) =>
    r.goldShareThreshold === null ||
    r.winRateAbove === null ||
    r.winRateBelow === null
      ? null
      : t("synergy.resourceSentence", {
          position: format.poste(r.position),
          threshold: format.taux(r.goldShareThreshold),
          above: format.taux(r.winRateAbove),
          gamesAbove: r.gamesAbove,
          below: format.taux(r.winRateBelow),
          gamesBelow: r.gamesBelow,
        });

  return (
    <Stack spacing={3}>
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
        <Stack spacing={2}>
          <DataTable<ResourceDto>
            dense
            caption={t("synergy.resources")}
            emptyTitle={t("synergy.noResources")}
            rows={data.resources}
            rowKey={(r) => r.position}
            columns={[
              {
                key: "position",
                header: t("synergy.position"),
                render: (r) => format.poste(r.position),
              },
              {
                key: "gold",
                header: t("synergy.goldShare"),
                align: "right",
                render: (r) =>
                  `${format.taux(r.goldShareInWins)} / ${format.taux(r.goldShareInLosses)}`,
              },
              {
                key: "damage",
                header: t("synergy.damageShare"),
                align: "right",
                render: (r) =>
                  `${format.taux(r.damageShareInWins)} / ${format.taux(r.damageShareInLosses)}`,
              },
              {
                key: "conversion",
                header: t("synergy.conversion"),
                align: "right",
                render: (r) => (
                  <Chip
                    size="small"
                    tone={
                      r.conversion !== null && r.conversion <= CONVERSION_FAIBLE
                        ? "warning"
                        : "neutral"
                    }
                    label={format.ecartEnPoints(r.conversion) ?? "—"}
                  />
                ),
              },
            ]}
          />
          {data.resources.map((r) => {
            const phrase = phraseRessource(r);
            return phrase ? <Text key={r.position}>{phrase}</Text> : null;
          })}
          {data.resources
            .filter(
              (r) => r.conversion !== null && r.conversion <= CONVERSION_FAIBLE,
            )
            .map((r) => (
              <Text key={`${r.position}-conv`} tone="secondary">
                {t("synergy.notConverting", {
                  position: format.poste(r.position),
                })}
              </Text>
            ))}
        </Stack>
      </Card>
    </Stack>
  );
}
