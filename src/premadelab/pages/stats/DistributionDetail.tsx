import { useTranslation } from "react-i18next";
import { Histogram, Stack, Text } from "../../../common";
import type { RadarReferencesDto, StatLineDto } from "../../types/stats";
import {
  PARTIES_MINIMUM_REPARTITION,
  REPARTIES,
  type RepartieKey,
  partEnDessous,
  repereDe,
} from "./distribution";
import { useStatsFormat } from "./statsFormat";
import { useReferenceGrid } from "./useReferenceGrid";

const PARTIES_MINIMUM = 5;

/**
 * Situe la moyenne du joueur, à son poste principal, parmi les parties de tous les joueurs à ce poste (Schub#129).
 * Absent sous le minimum de parties, du joueur comme de la répartition.
 */
export function DistributionDetail({
  keys,
  references,
  positions,
}: {
  keys: RepartieKey[];
  references: RadarReferencesDto | null | undefined;
  positions: StatLineDto[];
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const grille = useReferenceGrid(
    references?.position,
    "MEAN",
    references?.tier,
  );
  const ligne = positions.find((line) => line.key === references?.position);
  if (!grille?.distributions || !ligne || ligne.games < PARTIES_MINIMUM) {
    return null;
  }
  const poste = format.poste(references?.position);

  const blocs = REPARTIES.filter(({ key }) => keys.includes(key)).map(
    ({ key, field, discrete }) => {
      const repartition = grille.distributions?.[key];
      const valeur = ligne[field];
      if (
        !repartition ||
        repartition.count < PARTIES_MINIMUM_REPARTITION ||
        typeof valeur !== "number"
      ) {
        return null;
      }
      const dessous = partEnDessous(repartition, valeur, discrete);
      const niveau = dessous > 0.6 ? "high" : dessous < 0.4 ? "low" : "average";
      const chiffre = format.ratio(valeur);
      const derniere = repartition.counts.length - 1;
      const borne = (index: number) => {
        const valeurDeCase = index * repartition.step;
        return Number.isInteger(valeurDeCase)
          ? format.entier(valeurDeCase)
          : format.ratio(valeurDeCase);
      };
      return (
        <Stack key={key} spacing={1}>
          <Text variant="subtitle">{t(`distribution.${key}.title`)}</Text>
          <Text>
            {t(`distribution.${key}.${niveau}`, {
              value: chiffre,
              share: format.taux(niveau === "low" ? 1 - dessous : dessous),
              position: poste,
            })}
          </Text>
          <Histogram
            ariaLabel={t("distribution.aria", {
              metric: t(`distribution.${key}.title`),
              position: poste,
              value: chiffre,
            })}
            markerAt={repereDe(repartition, valeur, discrete)}
            markerLabel={t("distribution.you", { value: chiffre })}
            labelEvery={discrete ? 5 : 4}
            bars={repartition.counts.map((compte, index) => {
              const libelle =
                index === derniere ? `${borne(index)}+` : borne(index);
              return {
                label: libelle,
                value: compte,
                tooltip: t("distribution.bar", {
                  value: libelle,
                  share: format.taux(compte / repartition.count),
                }),
              };
            })}
          />
        </Stack>
      );
    },
  );

  if (blocs.every((bloc) => bloc === null)) {
    return null;
  }
  return (
    <Stack spacing={2}>
      {blocs}
      <Text variant="caption" tone="secondary">
        {t("distribution.basis", {
          games: format.entier(grille.distributions[keys[0]]?.count ?? 0),
          position: poste,
        })}
      </Text>
    </Stack>
  );
}
