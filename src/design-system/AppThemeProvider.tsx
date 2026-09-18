import { type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { THEME_MODE_STORAGE_KEY, appTheme } from "./theme";

/**
 * Le fournisseur de thème de l'application — le seul endroit où le thème se branche.
 *
 * <p>Il n'y a pas de bascule maison entre deux thèmes : `appTheme` porte les deux schémas de
 * couleur et MUI 7 les sert par variables CSS. C'est ce qui évite le scintillement clair-puis-
 * sombre au chargement, qu'un `ThemeProvider` conditionnel produit immanquablement.</p>
 *
 * <p>`defaultMode="system"` au premier passage : le visiteur reçoit la préférence de son
 * système. Dès qu'il choisit, MUI mémorise son choix sous {@link THEME_MODE_STORAGE_KEY} et s'y
 * tient. Le sombre reste le schéma canonique — c'est lui que le thème sert quand rien n'est
 * connu (`defaultColorScheme` dans {@link appTheme}).</p>
 */
export function AppThemeProvider({
  children,
  defaultMode = "system",
}: {
  children: ReactNode;
  defaultMode?: "light" | "dark" | "system";
}) {
  return (
    <ThemeProvider theme={appTheme} defaultMode={defaultMode} modeStorageKey={THEME_MODE_STORAGE_KEY}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
