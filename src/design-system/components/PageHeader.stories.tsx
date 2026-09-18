import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { Button } from "./Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PageHeader } from "./PageHeader";
import { ThemeModeToggle } from "./ThemeModeToggle";

const meta = {
  title: "Primitives/PageHeader",
  component: PageHeader,
  args: {
    title: "Pilotage des serveurs",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitreSeul: Story = {};

export const AvecSurtitreEtSousTitre: Story = {
  args: {
    eyebrow: "Configuration",
    subtitle:
      "Supervise tes instances, suis leur statut et lance les actions du bot depuis un point d'accès unique.",
  },
};

export const AvecActions: Story = {
  args: {
    eyebrow: "Configuration",
    subtitle: "Les actions de l'écran se posent à droite du titre.",
    actions: (
      <Stack direction="row" spacing={1} alignItems="center">
        <ThemeModeToggle />
        <LanguageSwitcher />
        <Button>Ajouter un serveur</Button>
      </Stack>
    ),
  },
};
