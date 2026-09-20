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

  /**
   * Le Storybook est publié SOUS UN SOUS-CHEMIN : `https://schultz-thomas.fr/storybook`.
   *
   * <p>Sans cette base, les fichiers construits sont référencés depuis la racine du domaine —
   * le navigateur demanderait `/assets/…` au lieu de `/storybook/assets/…`, et tomberait sur
   * l'application React, qui répond son `index.html` pour tout ce qu'elle ne connaît pas. On
   * obtient alors une page blanche sans la moindre erreur 404 pour l'expliquer.</p>
   */
  viteFinal: async (config) => ({ ...config, base: "/storybook/" }),
};

export default config;
