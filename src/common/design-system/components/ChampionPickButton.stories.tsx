import type { Meta, StoryObj } from "@storybook/react";
import { ChampionPickButton } from "./ChampionPickButton";
import { Stack } from "./Stack";

const meta = {
  title: "Formulaires/ChampionPickButton",
  component: ChampionPickButton,
  args: { label: "Choisir le champion", onClick: () => undefined },
} satisfies Meta<typeof ChampionPickButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vide: Story = {};

export const Choisi: Story = {
  args: { champion: { name: "Orianna" }, active: true },
};

export const Tailles: Story = {
  render: (args) => (
    <Stack direction="row" spacing={1} align="center">
      <ChampionPickButton {...args} size="small" />
      <ChampionPickButton {...args} champion={{ name: "Jax" }} size="small" />
      <ChampionPickButton {...args} />
    </Stack>
  ),
};
