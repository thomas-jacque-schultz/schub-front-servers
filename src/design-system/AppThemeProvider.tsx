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
 * <p><strong>`defaultMode="dark"`, inconditionnellement.</strong> Le chantier B avait livré
 * `"system"` : un visiteur dont le système est en clair voyait alors le site en clair à sa
 * première visite, alors que l'identité visuelle de Schub est sombre. La préférence du système
 * n'est donc plus consultée — c'est une décision de marque, pas un réglage de confort.</p>
 *
 * <p>Ce que ça ne change pas : le sélecteur reste, et le choix **explicite** d'un visiteur
 * continue d'être mémorisé sous {@link THEME_MODE_STORAGE_KEY}. Quelqu'un qui demande le clair
 * le garde ; quelqu'un qui ne demande rien reçoit le sombre.</p>
 */
export function AppThemeProvider({
  children,
  defaultMode = "dark",
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
