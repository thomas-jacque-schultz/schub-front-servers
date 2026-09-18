import { useEffect } from "react";
import type { Decorator, Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { useColorScheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { MemoryRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppThemeProvider } from "../src/design-system";
import "../src/i18n";

/**
 * Aligne le mode connu de MUI côté JavaScript sur le schéma choisi dans la barre d'outils.
 *
 * <p>`withThemeByDataAttribute` pose l'attribut sur `<html>`, ce qui suffit aux couleurs — elles
 * passent par des variables CSS. Mais un composant qui lit `theme.palette.mode` en JavaScript,
 * comme `StatusChip`, resterait sur l'ancien schéma : ces deux lignes évitent cet écart.</p>
 */
function ColorSchemeSync({ scheme }: { scheme: "light" | "dark" }) {
  const { setMode } = useColorScheme();
  useEffect(() => {
    setMode(scheme);
  }, [scheme, setMode]);
  return null;
}

function LanguageSync({ language }: { language: string }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [i18n, language]);
  return null;
}

const withSchubProviders: Decorator = (Story, context) => {
  const language = (context.globals.language as string) ?? "fr";
  const scheme = (context.globals.theme as string) === "clair" ? "light" : "dark";

  return (
    <MemoryRouter initialEntries={[language === "en" ? "/en" : "/"]}>
      <AppThemeProvider defaultMode={scheme}>
        <ColorSchemeSync scheme={scheme} />
        <LanguageSync language={language} />
        <Box sx={{ p: 3, bgcolor: "background.default", minHeight: "100%" }}>
          <Story />
        </Box>
      </AppThemeProvider>
    </MemoryRouter>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // Le fond vient du thème : proposer en plus les fonds de Storybook ferait mentir le rendu.
    backgrounds: { disable: true },
    a11y: { element: "#storybook-root" },
    options: {
      storySort: {
        order: ["Fondations", "Primitives"],
      },
    },
  },
  globalTypes: {
    language: {
      description: "Langue de l'interface",
      defaultValue: "fr",
      toolbar: {
        title: "Langue",
        icon: "globe",
        items: [
          { value: "fr", title: "Français" },
          { value: "en", title: "English" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    withSchubProviders,
    withThemeByDataAttribute({
      themes: { sombre: "dark", clair: "light" },
      defaultTheme: "sombre",
      attributeName: "data-mui-color-scheme",
    }),
  ],
};

export default preview;
