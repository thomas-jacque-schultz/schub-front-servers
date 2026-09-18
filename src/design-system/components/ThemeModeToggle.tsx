import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

/**
 * La bascule clair / sombre.
 *
 * <p>Elle ne gère ni état ni `localStorage` : `useColorScheme` s'en charge, et c'est ce qui rend
 * le choix persistant sans une ligne de code ici. Tant que MUI n'a pas résolu le schéma — le
 * temps d'un rendu — le bouton reste inerte plutôt que d'afficher une icône qui changerait
 * aussitôt.</p>
 */
export function ThemeModeToggle({ size = "medium" }: { size?: "small" | "medium" }) {
  const { mode, systemMode, setMode } = useColorScheme();
  const { t } = useTranslation();

  const resolved = mode === "system" ? systemMode : mode;
  if (!resolved) {
    return <IconButton size={size} disabled aria-hidden />;
  }

  const next = resolved === "dark" ? "light" : "dark";
  const label = next === "dark" ? t("theme.switchToDark") : t("theme.switchToLight");

  return (
    <Tooltip title={label}>
      <IconButton size={size} onClick={() => setMode(next)} aria-label={label}>
        {resolved === "dark" ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
