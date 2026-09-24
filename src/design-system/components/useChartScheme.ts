import { useColorScheme } from "@mui/material/styles";
import { type ColorSchemeName, chartColors, palettes } from "../tokens";

/**
 * Les couleurs d'un graphique SVG dans le schéma affiché. Avec les variables CSS de MUI, useTheme() rend
 * toujours le schéma par défaut : un attribut fill ne suit pas le basculement, il faut lire le schéma actif.
 */
export const useChartScheme = () => {
  const { mode, systemMode } = useColorScheme();
  const scheme: ColorSchemeName =
    (mode === "system" ? systemMode : mode) === "light" ? "light" : "dark";
  return { scheme, chart: chartColors[scheme], palette: palettes[scheme] };
};
