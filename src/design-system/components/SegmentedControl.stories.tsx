import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const meta = {
  title: "Saisie/SegmentedControl",
  component: SegmentedControl,
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const OPTIONS = [
  { value: "team", label: "Équipe" },
  { value: "met", label: "Rencontrés" },
  { value: "league", label: "Ligue", disabled: true },
];

export const Referentiels: Story = {
  args: { label: "Référentiel", options: OPTIONS, value: "team", onChange: () => undefined },
  render: (args) => {
    const [valeur, setValeur] = useState(args.value);
    return <SegmentedControl {...args} value={valeur} onChange={setValeur} />;
  },
};
