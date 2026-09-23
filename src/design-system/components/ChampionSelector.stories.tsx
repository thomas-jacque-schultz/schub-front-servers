import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChampionSelector } from "./ChampionSelector";

const entries = [
  "Ahri",
  "Aurelion Sol",
  "Jax",
  "Jinx",
  "Lee Sin",
  "Orianna",
  "Thresh",
  "Zilean",
].map((name) => ({ key: name.replace(/\s/g, ""), name }));

const meta = {
  title: "Formulaires/ChampionSelector",
  component: ChampionSelector,
  args: {
    entries,
    mode: "single",
    selected: [],
    onChange: () => undefined,
    searchLabel: "Rechercher un champion",
    noResultLabel: "Aucun champion ne correspond.",
  },
} satisfies Meta<typeof ChampionSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChoixUnique: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string[]>(["Orianna"]);
    return (
      <ChampionSelector
        {...args}
        selected={selected}
        onChange={setSelected}
        disabledKeys={["Jinx"]}
      />
    );
  },
};

export const ChoixMultiple: Story = {
  args: { mode: "multiple" },
  render: (args) => {
    const [selected, setSelected] = useState<string[]>(["Jax", "LeeSin"]);
    return <ChampionSelector {...args} selected={selected} onChange={setSelected} />;
  },
};
