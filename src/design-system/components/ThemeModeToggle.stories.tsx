import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeModeToggle } from "./ThemeModeToggle";

/**
 * Les deux bascules de l'interface. Attention en les relisant : dans Storybook, la barre
 * d'outils pilote déjà le thème et la langue, donc ces contrôles agissent sur le même état.
 * C'est dans l'application qu'ils se jugent pour de bon.
 */
const meta = {
  title: "Fondations/Bascules",
  component: ThemeModeToggle,
} satisfies Meta<typeof ThemeModeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Theme: Story = {};

export const Langue: Story = {
  render: () => <LanguageSwitcher />,
};

export const LesDeux: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Le sélecteur de langue change l'URL : « / » en français, « /en » en anglais.
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <ThemeModeToggle />
        <LanguageSwitcher />
      </Stack>
    </Stack>
  ),
};
