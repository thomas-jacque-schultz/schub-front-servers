import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeModeToggle } from "./ThemeModeToggle";

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
