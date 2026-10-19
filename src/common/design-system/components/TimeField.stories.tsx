import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TimeField } from "./TimeField";

const meta = {
  title: "Primitives/TimeField",
  component: TimeField,
  args: {
    label: "Début",
    minuteLabel: "Minutes",
    value: "21:00",
    onChange: () => undefined,
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VingtQuatreHeures: Story = {
  render: (args) => {
    const [valeur, setValeur] = useState(args.value);
    return <TimeField {...args} value={valeur} onChange={setValeur} />;
  },
};
