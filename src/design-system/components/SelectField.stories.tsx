import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SelectField } from "./SelectField";

const OPTIONS = [
  { value: "r1", label: "Visiteur" },
  { value: "r2", label: "Modérateur" },
  { value: "r3", label: "Administrateur" },
  { value: "r4", label: "Propriétaire", disabled: true },
];

const meta = {
  title: "Primitives/SelectField",
  component: SelectField,
  args: { label: "Rôle", value: "r2", options: OPTIONS, fullWidth: true, onChange: () => {} },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export const AvecOptionInterdite: Story = {
  args: { helperText: "Le rôle réservé n'est attribuable par personne." },
};

export const EnErreur: Story = {
  args: { error: true, value: "", helperText: "Choisissez un rôle." },
};

export const Figee: Story = { args: { disabled: true } };

export const Interactive: Story = {
  render: function Interactive(args) {
    const [value, setValue] = useState(args.value);
    return <SelectField {...args} value={value} onChange={setValue} />;
  },
};
