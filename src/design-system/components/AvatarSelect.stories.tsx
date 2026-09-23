import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AvatarSelect } from "./AvatarSelect";

const options = ["Joueur A", "Joueur B", "Joueur C", "Joueur D"].map((name, index) => ({
  value: name,
  name,
  taken: index === 3,
  hint: index === 3 ? `${name} — déjà au mid` : undefined,
}));

const meta = {
  title: "Formulaires/AvatarSelect",
  component: AvatarSelect,
  args: { label: "Joueur", options, value: null, onChange: () => undefined },
} satisfies Meta<typeof AvatarSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactif: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>("Joueur B");
    return <AvatarSelect {...args} value={value} onChange={setValue} />;
  },
};
