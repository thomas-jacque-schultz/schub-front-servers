import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTranslation } from "react-i18next";
import { type AppLanguage, SUPPORTED_LANGUAGES } from "../../i18n/config";
import { useLanguageSwitcher } from "../../i18n/navigation";

/**
 * Le sélecteur de langue.
 *
 * <p>Il **change l'URL** : `/` en français, `/en/…` en anglais. C'est la seule façon que la
 * version anglaise soit indexable et partageable ; un sélecteur qui ne modifierait qu'un état
 * React laisserait les deux versions sur la même adresse.</p>
 */
export function LanguageSwitcher({ size = "small" }: { size?: "small" | "medium" }) {
  const { t } = useTranslation();
  const { current, switchTo } = useLanguageSwitcher();

  return (
    <ToggleButtonGroup
      size={size}
      exclusive
      value={current}
      aria-label={t("language.label")}
      onChange={(_event, value: AppLanguage | null) => value && switchTo(value)}
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <ToggleButton
          key={language}
          value={language}
          aria-label={t("language.switchTo", { language: t(`language.${language}`) })}
          sx={{ px: 1.25, textTransform: "uppercase", fontWeight: 600 }}
        >
          {language}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
