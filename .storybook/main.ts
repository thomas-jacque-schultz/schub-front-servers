import type { StorybookConfig } from "@storybook/react-vite";

/**
 * Storybook 8, builder Vite — le même que l'application, donc la même résolution de modules et
 * les mêmes alias. Une story qui rend correctement ici rend correctement dans l'app.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    // L'accessibilité se vérifie composant par composant, pendant qu'on le dessine : c'est là
    // qu'un contraste insuffisant coûte une minute à corriger plutôt qu'une campagne d'audit.
    "@storybook/addon-a11y",
    // Branché sur les deux schémas de couleur du thème, via `data-mui-color-scheme`.
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  staticDirs: ["../public"],
};

export default config;
