import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MACRO_ICONS } from "./macroIcons";
import { PictogramPicker } from "./PictogramPicker";

function Interactive() {
  const [choix, setChoix] = useState<string | null>("ward");
  return (
    <PictogramPicker
      label="Balises"
      options={[
        { value: "ward", name: "Balise", src: MACRO_ICONS.ward },
        { value: "controlWard", name: "Balise de contrôle", src: MACRO_ICONS.controlWard },
        { value: "farsight", name: "Altération : longue-vue", src: MACRO_ICONS.farsight },
      ]}
      value={choix}
      onChange={setChoix}
    />
  );
}

const meta = {
  title: "Formulaires/PictogramPicker",
  component: Interactive,
} satisfies Meta<typeof Interactive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Balises: Story = {};
