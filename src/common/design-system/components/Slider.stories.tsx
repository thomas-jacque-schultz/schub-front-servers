import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Design system/Slider",
  component: Slider,
};
export default meta;

function Exemple() {
  const [valeur, setValeur] = useState(40);
  return (
    <Slider
      label="Taille"
      value={valeur}
      min={0}
      max={100}
      step={1}
      onChange={setValeur}
    />
  );
}

export const Defaut: StoryObj<typeof Slider> = { render: () => <Exemple /> };
