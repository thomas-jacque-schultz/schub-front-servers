import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Columns,
  Disclosure,
  Frame,
  MeterBar,
  Stack,
  Text,
} from "../../../common";
import type { ClosenessDto } from "../../types/stats";
import { resumeDeProximite } from "./proximite";
import { useStatsFormat } from "./statsFormat";

export interface ClosenessCardProps {
  closeness: ClosenessDto[];
  minimum: number;
}

/** Schub#154 : qui joue près de qui, résumé en trois encadrés et détaillé joueur par joueur. */
export function ClosenessCard({ closeness, minimum }: ClosenessCardProps) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const [detailOuvert, setDetailOuvert] = useState(false);
  const { soude, isole, avant, apres } = resumeDeProximite(closeness);

  return (
    <Card
      title={t("synergy.closeness.title")}
      footnote={t("synergy.closeness.hint", { count: minimum })}
    >
      {closeness.every((membre) => membre.mates.length === 0) ? (
        <Text tone="secondary">{t("synergy.closeness.none")}</Text>
      ) : (
        <Stack spacing={2}>
          {soude === null ? (
            <Text tone="secondary">
              {t("synergy.closeness.noPair", { count: minimum })}
            </Text>
          ) : (
            <Columns minWidth={220} count={3}>
              <Encadre
                titre={t("synergy.closeness.tightest")}
                valeur={format.taux(soude.share)}
              >
                {t("synergy.closeness.tightestText", {
                  a: soude.a,
                  b: soude.b,
                  early: format.taux(soude.early),
                  late: format.taux(soude.late),
                  count: soude.games,
                })}
              </Encadre>
              {isole !== null && (
                <Encadre
                  titre={t("synergy.closeness.apart")}
                  valeur={format.taux(isole.share)}
                >
                  {t("synergy.closeness.apartText", {
                    name: isole.nom,
                    share: format.taux(isole.share),
                    mate: isole.proche,
                    mateShare: format.taux(isole.procheShare),
                  })}
                </Encadre>
              )}
              {avant !== null && apres !== null && (
                <Encadre
                  titre={t("synergy.closeness.regroup")}
                  valeur={format.ecartEnPoints(apres - avant) ?? format.absent}
                >
                  {t("synergy.closeness.regroupText", {
                    early: format.taux(avant),
                    late: format.taux(apres),
                  })}
                </Encadre>
              )}
            </Columns>
          )}
          <Disclosure
            title={t("synergy.closeness.byPlayer")}
            open={detailOuvert}
            onToggle={setDetailOuvert}
          >
            <Columns minWidth={240} count={Math.min(closeness.length, 5)}>
              {closeness.map((membre) => (
                <Proches
                  key={membre.memberId}
                  membre={membre}
                  minimum={minimum}
                />
              ))}
            </Columns>
          </Disclosure>
        </Stack>
      )}
    </Card>
  );
}

function Encadre({
  titre,
  valeur,
  children,
}: {
  titre: string;
  valeur: string;
  children: ReactNode;
}) {
  return (
    <Frame>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} align="center" justify="between">
          <Text variant="subtitle">{titre}</Text>
          <Text variant="caption" mono>
            {valeur}
          </Text>
        </Stack>
        <Text variant="caption">{children}</Text>
      </Stack>
    </Frame>
  );
}

// Une barre par coéquipier, de celui près duquel il joue le plus à celui qu'il croise le moins.
function Proches({
  membre,
  minimum,
}: {
  membre: ClosenessDto;
  minimum: number;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  return (
    <Frame>
      <Stack spacing={1}>
        <Text variant="subtitle">{membre.displayName ?? "?"}</Text>
        {membre.mates.length === 0 && (
          <Text variant="caption" tone="secondary">
            {t("synergy.closeness.noMate")}
          </Text>
        )}
        {membre.mates.map((proche) =>
          proche.share === null ? (
            <Text key={proche.memberId} variant="caption" tone="secondary">
              {t("synergy.closeness.tooFew", {
                name: proche.displayName ?? "?",
                count: proche.games,
                minimum,
              })}
            </Text>
          ) : (
            <MeterBar
              key={proche.memberId}
              value={proche.share}
              label={proche.displayName ?? "?"}
              valueLabel={format.taux(proche.share)}
              hint={t("synergy.closeness.detail", {
                early: format.taux(proche.earlyShare),
                late: format.taux(proche.lateShare),
                count: proche.games,
              })}
            />
          ),
        )}
      </Stack>
    </Frame>
  );
}
