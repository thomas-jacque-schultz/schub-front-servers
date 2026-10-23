import { type ReactNode, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { createGameTheme } from "./gameTheme";
import { IdentityContext } from "./identity";
import { identity } from "./tokens";

// Une clé que rien n'écrit : les jeux restent sombres, leur ambiance n'a pas de variante claire.
const MODE_DES_JEUX = "mode-des-jeux";

/** Le fournisseur des mini-jeux, sur le thème des jeux. */
export function GameThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createGameTheme(), []);
  return (
    <IdentityContext.Provider value={identity}>
      <ThemeProvider
        theme={theme}
        defaultMode="dark"
        modeStorageKey={MODE_DES_JEUX}
      >
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </IdentityContext.Provider>
  );
}
