import type { Meta, StoryObj } from "@storybook/react";
import { ChampionIcon } from "./ChampionIcon";
import { Stack } from "./Stack";

const meta = {
  title: "Données/ChampionIcon",
  component: ChampionIcon,
} satisfies Meta<typeof ChampionIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SansIcone: Story = {
  args: { name: "Aurelion Sol" },
};

export const Retenu: Story = {
  args: { name: "Lee Sin", selected: true },
};

export const Ecarte: Story = {
  args: { name: "Zilean", dimmed: true },
};

export const Tailles: Story = {
  args: { name: "Jax" },
  render: (args) => (
    <Stack direction="row" spacing={1} align="center">
      <ChampionIcon {...args} size="small" />
      <ChampionIcon {...args} size="medium" />
      <ChampionIcon {...args} size="large" />
    </Stack>
  ),
};
