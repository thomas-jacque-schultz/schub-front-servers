import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
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

  // Publié sous /storybook : sans base, les assets sont demandés à la racine et l'app React répond index.html (page blanche, aucun 404).
  viteFinal: async (config) => ({ ...config, base: "/storybook/" }),
};

export default config;
