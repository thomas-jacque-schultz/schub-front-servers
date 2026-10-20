import { useTranslation } from "react-i18next";
import { Columns, FeatureTile, useLocalizedPath } from "../../common";

const TUILES = [
  { key: "player", to: undefined },
  { key: "team", to: "/teams" },
  { key: "draft", to: "/combos/silver-gold/adc-sup" },
] as const;

/** Ce que fait PremadeLab, en captures du produit plutôt qu'en paragraphes (#72). */
export function HomeTiles() {
  const { t } = useTranslation("lol");
  const localize = useLocalizedPath();

  return (
    <Columns minWidth={240} count={3}>
      {TUILES.map(({ key, to }) => (
        <FeatureTile
          key={key}
          image={t(`home.tiles.${key}.image`)}
          imageAlt={t(`home.tiles.${key}.alt`)}
          title={t(`home.tiles.${key}.title`)}
          to={to && localize(to)}
        />
      ))}
    </Columns>
  );
}
