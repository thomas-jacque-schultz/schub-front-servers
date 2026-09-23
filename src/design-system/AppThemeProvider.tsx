import { type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { THEME_MODE_STORAGE_KEY, appTheme } from "./theme";

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
