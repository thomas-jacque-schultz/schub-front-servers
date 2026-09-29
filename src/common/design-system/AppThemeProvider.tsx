import { type ReactNode, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { IdentityContext } from "./identity";
import {
  THEME_MODE_STORAGE_KEY,
  createAppTheme,
  migrateThemeModeKey,
} from "./theme";
import { identity } from "./tokens";

migrateThemeModeKey();

export function AppThemeProvider({
  children,
  defaultMode = "dark",
}: {
  children: ReactNode;
  defaultMode?: "light" | "dark" | "system";
}) {
  const theme = useMemo(() => createAppTheme(identity), []);

  return (
    <IdentityContext.Provider value={identity}>
      <ThemeProvider
        theme={theme}
        defaultMode={defaultMode}
        modeStorageKey={THEME_MODE_STORAGE_KEY}
      >
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </IdentityContext.Provider>
  );
}
