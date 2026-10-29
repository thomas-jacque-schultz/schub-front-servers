import { useTranslation } from "react-i18next";
import {
  SegmentedControl,
  Stack,
  SwatchButton,
  Text,
  inkColors,
  inkWidths,
} from "../../../common";

/** L'encre et l'épaisseur des outils de dessin (Schub#169). */
export function DessinReglages({
  encre,
  onEncre,
  epaisseur,
  onEpaisseur,
}: {
  encre: string;
  onEncre: (encre: string) => void;
  epaisseur: number;
  onEpaisseur: (epaisseur: number) => void;
}) {
  const { t } = useTranslation("lol");
  return (
    <Stack spacing={1.5}>
      <Stack spacing={1}>
        <Text variant="caption" tone="secondary">
          {t("macro.ink")}
        </Text>
        <Stack direction="row" spacing={0.75} wrap>
          {inkColors.map((couleur) => (
            <SwatchButton
              key={couleur}
              color={couleur}
              label={couleur}
              selected={couleur === encre}
              onClick={() => onEncre(couleur)}
            />
          ))}
        </Stack>
      </Stack>
      <Stack spacing={1}>
        <Text variant="caption" tone="secondary">
          {t("macro.width")}
        </Text>
        <SegmentedControl
          label={t("macro.width")}
          value={String(inkWidths.indexOf(epaisseur as (typeof inkWidths)[number]))}
          onChange={(rang) => onEpaisseur(inkWidths[Number(rang)])}
          options={inkWidths.map((_, rang) => ({
            value: String(rang),
            label: String(rang + 1),
          }))}
        />
        <Text variant="caption" tone="secondary">
          {t("macro.widthHint")}
        </Text>
      </Stack>
    </Stack>
  );
}
