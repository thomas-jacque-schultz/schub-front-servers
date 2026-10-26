import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Columns,
  ConfidenceBadge,
  DataTable,
  Disclosure,
  InsightCard,
  MeterBar,
  Stack,
  Text,
} from "../../../common";
import type { HolderDto, RolesDto } from "../../types/stats";
import {
  COMBATS_MINIMUM,
  OBJECTIFS_MINIMUM,
  PARTIES_MINIMUM,
  compagnonDuSupport,
  ligneDu,
  prochesDu,
} from "./soutiens";
import { POSTES, useStatsFormat, type Poste } from "./statsFormat";

export interface RoleSupportPanelProps {
  roles: RolesDto;
}

/** Schub#156 : où joue le support, l'ADC laissé seul, le jungler soutenu — par poste, quel que soit le joueur. */
export function RoleSupportPanel({ roles }: RoleSupportPanelProps) {
  const { t } = useTranslation("stats");
  const [pairesOuvertes, setPairesOuvertes] = useState(false);

  if (roles.games === 0) {
    return <Text tone="secondary">{t("roles.none")}</Text>;
  }

  return (
    <Stack spacing={2}>
      <Text variant="caption" tone="secondary">
        {t("roles.intro", { count: roles.games })}
      </Text>
      <Columns minWidth={300} count={3}>
        <SupportCard roles={roles} />
        <AdcCard roles={roles} />
        <JunglerCard roles={roles} />
      </Columns>
      <Disclosure
        title={t("roles.pairs.title")}
        open={pairesOuvertes}
        onToggle={setPairesOuvertes}
      >
        <Paires roles={roles} />
      </Disclosure>
      <Text variant="caption" tone="secondary">
        {t("roles.method")}
      </Text>
    </Stack>
  );
}

function useNoms() {
  const { t } = useTranslation("stats");
  return {
    nom: (poste: Poste) => t(`roles.name.${poste}`),
    le: (poste: Poste) => t(`roles.the.${poste}`),
  };
}

function Badge({
  parties,
  objectifs,
  combats,
}: {
  parties: number;
  objectifs?: number;
  combats?: number;
}) {
  const { t } = useTranslation("stats");
  const titre =
    parties < PARTIES_MINIMUM
      ? t("roles.lowGames", { count: parties, minimum: PARTIES_MINIMUM })
      : objectifs !== undefined && objectifs < OBJECTIFS_MINIMUM
        ? t("roles.lowObjectives", {
            count: objectifs,
            minimum: OBJECTIFS_MINIMUM,
          })
        : combats !== undefined && combats < COMBATS_MINIMUM
          ? t("roles.lowFights", { count: combats, minimum: COMBATS_MINIMUM })
          : null;
  return titre === null ? null : (
    <ConfidenceBadge label={t("verdict.lowConfidence")} title={titre} />
  );
}

function SupportCard({ roles }: { roles: RolesDto }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { nom, le } = useNoms();
  const support = ligneDu(roles, "UTILITY");
  const proches = prochesDu(roles, "UTILITY");
  const compagnon = compagnonDuSupport(roles);
  const prises = roles.takes;

  return (
    <InsightCard
      title={t("roles.support.title")}
      verdict={null}
      badge={<Badge parties={roles.games} objectifs={roles.objectives} />}
      conclusion={
        compagnon === null
          ? undefined
          : compagnon === "alone"
            ? t("roles.support.conclusionAlone")
            : t("roles.support.conclusion", { mate: le(compagnon) })
      }
      visual={
        <Stack spacing={1}>
          <Text variant="caption" tone="secondary">
            {t("roles.support.caption")}
          </Text>
          {proches.map((p) => (
            <MeterBar
              key={p.poste}
              value={p.apres}
              label={nom(p.poste)}
              valueLabel={format.taux(p.apres)}
              hint={t("roles.before", { share: format.taux(p.avant) })}
            />
          ))}
          <MeterBar
            value={support?.lateAlone ?? null}
            label={t("roles.alone")}
            valueLabel={format.taux(support?.lateAlone)}
            hint={t("roles.before", {
              share: format.taux(support?.earlyAlone),
            })}
          />
        </Stack>
      }
      details={<Titulaires roles={roles} postes={["UTILITY"]} />}
      detailsLabel={t("verdict.details")}
      hideDetailsLabel={t("verdict.hideDetails")}
    >
      <Stack spacing={0.5}>
        <Text variant="caption">
          {t("roles.support.objectives", {
            takenWith: prises.takenWithSupport,
            with: prises.withSupport,
            takenWithout: prises.takenWithoutSupport,
            without: prises.withoutSupport,
            share: format.taux(support?.objectivePresence),
          })}
        </Text>
        {roles.jungleFights > 0 && (
          <Text variant="caption">
            {t("roles.support.fights", {
              share: format.taux(support?.jungleFightPresence),
            })}
          </Text>
        )}
      </Stack>
    </InsightCard>
  );
}

function AdcCard({ roles }: { roles: RolesDto }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { nom, le } = useNoms();
  const adc = ligneDu(roles, "BOTTOM");
  const plusProche = prochesDu(roles, "BOTTOM")[0];
  // L'ADC d'abord, puis les autres postes du plus souvent seul au moins souvent.
  const ordre = [
    "BOTTOM" as Poste,
    ...POSTES.filter((p) => p !== "BOTTOM").sort(
      (x, y) =>
        (ligneDu(roles, y)?.lateAlone ?? -1) -
        (ligneDu(roles, x)?.lateAlone ?? -1),
    ),
  ];

  return (
    <InsightCard
      title={t("roles.adc.title")}
      verdict={null}
      badge={<Badge parties={roles.games} />}
      conclusion={
        adc?.lateAlone == null
          ? undefined
          : t("roles.adc.conclusion", { share: format.taux(adc.lateAlone) })
      }
      visual={
        <Stack spacing={1}>
          <Text variant="caption" tone="secondary">
            {t("roles.adc.caption")}
          </Text>
          {ordre.map((poste) => {
            const ligne = ligneDu(roles, poste);
            return (
              <MeterBar
                key={poste}
                value={ligne?.lateAlone ?? null}
                label={nom(poste)}
                valueLabel={format.taux(ligne?.lateAlone)}
                hint={t("roles.before", {
                  share: format.taux(ligne?.earlyAlone),
                })}
              />
            );
          })}
        </Stack>
      }
      details={
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Text variant="caption" tone="secondary">
              {t("roles.adc.mates")}
            </Text>
            {prochesDu(roles, "BOTTOM").map((p) => (
              <MeterBar
                key={p.poste}
                value={p.apres}
                label={nom(p.poste)}
                valueLabel={format.taux(p.apres)}
                hint={t("roles.before", { share: format.taux(p.avant) })}
              />
            ))}
          </Stack>
          <Titulaires roles={roles} postes={["BOTTOM"]} />
        </Stack>
      }
      detailsLabel={t("verdict.details")}
      hideDetailsLabel={t("verdict.hideDetails")}
    >
      {plusProche?.apres != null && (
        <Text variant="caption">
          {t("roles.adc.closest", {
            mate: le(plusProche.poste),
            share: format.taux(plusProche.apres),
          })}
        </Text>
      )}
    </InsightCard>
  );
}

function JunglerCard({ roles }: { roles: RolesDto }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { nom, le } = useNoms();
  const aides = POSTES.filter((p) => p !== "JUNGLE")
    .map((poste) => ({ poste, ligne: ligneDu(roles, poste) }))
    .sort(
      (x, y) =>
        (y.ligne?.objectivePresence ?? -1) - (x.ligne?.objectivePresence ?? -1),
    );
  const combats = roles.fights;
  const premier = aides[0];

  return (
    <InsightCard
      title={t("roles.jungler.title")}
      verdict={null}
      badge={
        <Badge
          parties={roles.games}
          objectifs={roles.objectives}
          combats={roles.jungleFights}
        />
      }
      conclusion={
        roles.jungleFights > 0
          ? t("roles.jungler.conclusionFights", {
              alone: combats.alone,
              total: roles.jungleFights,
            })
          : premier?.ligne?.objectivePresence != null
            ? t("roles.jungler.conclusionObjectives", {
                mate: le(premier.poste),
              })
            : undefined
      }
      visual={
        <Stack spacing={1}>
          <Text variant="caption" tone="secondary">
            {t("roles.jungler.caption")}
          </Text>
          {aides.map(({ poste, ligne }) => (
            <MeterBar
              key={poste}
              value={ligne?.objectivePresence ?? null}
              label={nom(poste)}
              valueLabel={format.taux(ligne?.objectivePresence)}
              hint={
                roles.jungleFights > 0
                  ? t("roles.jungler.fightsHint", {
                      share: format.taux(ligne?.jungleFightPresence),
                    })
                  : undefined
              }
            />
          ))}
        </Stack>
      }
      details={
        <Titulaires
          roles={roles}
          postes={["JUNGLE", "TOP", "MIDDLE", "BOTTOM", "UTILITY"]}
          avecJungler
        />
      }
      detailsLabel={t("verdict.details")}
      hideDetailsLabel={t("verdict.hideDetails")}
    >
      <Stack spacing={0.5}>
        <Text variant="caption">
          {t("roles.jungler.crowd", {
            takenCrowded: roles.takes.takenCrowded,
            crowded: roles.takes.crowded,
            takenSparse: roles.takes.takenSparse,
            sparse: roles.takes.sparse,
          })}
        </Text>
        {roles.jungleFights > 0 && (
          <Text variant="caption">
            {t("roles.jungler.fights", {
              wonAlone: combats.wonAlone,
              alone: combats.alone,
              wonHelped: combats.wonHelped,
              helped: combats.helped,
            })}
          </Text>
        )}
      </Stack>
    </InsightCard>
  );
}

// La personne qui tient le poste compte (Schub#107) : ses chiffres à ce poste, partie par partie groupées.
function Titulaires({
  roles,
  postes,
  avecJungler = false,
}: {
  roles: RolesDto;
  postes: Poste[];
  avecJungler?: boolean;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { nom } = useNoms();
  const lignes = roles.holders
    .filter((h) => (postes as string[]).includes(h.position))
    .sort(
      (x, y) =>
        postes.indexOf(x.position as Poste) -
          postes.indexOf(y.position as Poste) || y.games - x.games,
    );
  return (
    <DataTable<HolderDto>
      dense
      caption={t("roles.holders.caption")}
      emptyTitle={t("roles.none")}
      rows={lignes}
      rowKey={(h) => `${h.position}:${h.memberId}`}
      columns={[
        ...(postes.length > 1
          ? [
              {
                key: "position",
                header: t("roles.holders.position"),
                render: (h: HolderDto) => nom(h.position as Poste),
              },
            ]
          : []),
        {
          key: "player",
          header: t("roles.holders.player"),
          render: (h) => h.displayName ?? "?",
        },
        {
          key: "games",
          header: t("roles.holders.games"),
          align: "right",
          render: (h) => h.games,
        },
        {
          key: "lateAlone",
          header: t("roles.holders.lateAlone"),
          align: "right",
          render: (h) => format.taux(h.lateAlone),
        },
        ...(avecJungler || postes.includes("UTILITY")
          ? [
              {
                key: "withJungler",
                header: t("roles.holders.withJungler"),
                align: "right" as const,
                render: (h: HolderDto) => format.taux(h.lateWithJungler),
              },
            ]
          : []),
        {
          key: "objectives",
          header: t("roles.holders.objectives"),
          align: "right",
          render: (h) => format.taux(h.objectivePresence),
        },
      ]}
    />
  );
}

function Paires({ roles }: { roles: RolesDto }) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const { nom } = useNoms();
  return (
    <DataTable<RolesDto["pairs"][number]>
      dense
      caption={t("roles.pairs.title")}
      emptyTitle={t("roles.none")}
      rows={roles.pairs}
      rowKey={(p) => `${p.position}:${p.matePosition}`}
      columns={[
        {
          key: "pair",
          header: t("roles.pairs.pair"),
          render: (p) =>
            t("roles.pairs.label", {
              a: nom(p.position as Poste),
              b: nom(p.matePosition as Poste),
            }),
        },
        {
          key: "before",
          header: t("roles.pairs.before"),
          align: "right",
          render: (p) => format.taux(p.earlyShare),
        },
        {
          key: "after",
          header: t("roles.pairs.after"),
          align: "right",
          render: (p) => format.taux(p.lateShare),
        },
      ]}
    />
  );
}
