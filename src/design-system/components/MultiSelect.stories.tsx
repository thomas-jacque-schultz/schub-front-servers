import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";

const OPTIONS: MultiSelectOption[] = [
  { value: "u1", label: "capitaine.nemo", description: "Modérateur" },
  { value: "u2", label: "vega.orbitale", description: "Administrateur" },
  { value: "u3", label: "lanterne.sourde", description: "Visiteur" },
  { value: "u4", label: "atelier.fantome", description: "Visiteur" },
];

const meta = {
  title: "Primitives/MultiSelect",
  component: MultiSelect,
  args: {
    label: "Administrateurs du serveur",
    values: ["u1"],
    options: OPTIONS,
    placeholder: "Choisir des comptes",
    noOptionsText: "Aucun compte",
    helperText: "Ils peuvent démarrer et arrêter ce serveur, rien de plus.",
    onChange: () => {},
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {};

export const Vide: Story = { args: { values: [] } };

export const PlusieursRetenus: Story = { args: { values: ["u1", "u2", "u3"] } };

export const AvecValeurOrpheline: Story = {
  args: { values: ["u1", "compte-supprime-42"] },
};

export const Figee: Story = { args: { disabled: true } };

export const Interactive: Story = {
  render: function Interactive(args) {
    const [values, setValues] = useState<string[]>(args.values);
    return <MultiSelect {...args} values={values} onChange={setValues} />;
  },
};
