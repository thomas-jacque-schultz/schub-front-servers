import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AvatarToggleGroup } from "./AvatarToggleGroup";

const options = ["Joueur A", "Joueur B", "Joueur C", "Joueur D", "Joueur E"].map((name) => ({
  value: name,
  name,
}));

const meta = {
  title: "Formulaires/AvatarToggleGroup",
  component: AvatarToggleGroup,
  args: { label: "Joueurs affichés", options, values: [], onChange: () => undefined },
} satisfies Meta<typeof AvatarToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactif: Story = {
  render: (args) => {
    const [values, setValues] = useState<string[]>(["Joueur A", "Joueur C"]);
    return <AvatarToggleGroup {...args} values={values} onChange={setValues} />;
  },
};
