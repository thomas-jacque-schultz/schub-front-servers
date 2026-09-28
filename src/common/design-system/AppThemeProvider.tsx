import { type ReactNode, useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { IdentityContext } from "./identity";
import {
  THEME_MODE_STORAGE_KEY,
  createAppTheme,
  migrateThemeModeKey,
} from "./theme";
import { identities, type AppBrand } from "./tokens";

migrateThemeModeKey();

export function AppThemeProvider({
  children,
  brand = "schub",
  defaultMode = "dark",
}: {
  children: ReactNode;
  brand?: AppBrand;
  defaultMode?: "light" | "dark" | "system";
}) {
  const identity = identities[brand];
  const theme = useMemo(() => createAppTheme(identity), [identity]);

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
