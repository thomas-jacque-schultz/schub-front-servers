import type { Meta, StoryObj } from "@storybook/react";
import { ChampionRow } from "./ChampionRow";
import { Stack } from "./Stack";

const meta = {
  title: "Données/ChampionRow",
  component: ChampionRow,
} satisfies Meta<typeof ChampionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Paire: Story = {
  args: { columns: 2, champions: [{ name: "Jinx" }, { name: "Thresh" }] },
};

export const LignesAlignees: Story = {
  args: { columns: 3, champions: [] },
  render: (args) => (
    <Stack spacing={1}>
      <ChampionRow
        {...args}
        champions={[{ name: "Jax" }, { name: "Ahri" }, { name: "Nami" }]}
      />
      <ChampionRow
        {...args}
        champions={[
          { name: "Aurelion Sol" },
          { name: "Tahm Kench" },
          { name: "Lee Sin" },
        ]}
      />
    </Stack>
  ),
};
