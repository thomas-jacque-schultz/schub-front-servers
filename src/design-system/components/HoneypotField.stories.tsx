import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { HoneypotField } from "./HoneypotField";

const meta = {
  title: "Primitives/HoneypotField",
  component: HoneypotField,
  args: { name: "website", value: "", onChange: () => {}, label: "Ne pas remplir" },
} satisfies Meta<typeof HoneypotField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * La story ne montre presque rien, et c'est le résultat attendu : le champ est hors de l'écran.
 * Ce qu'elle permet de vérifier, c'est qu'il ne pousse **aucun** espace dans la mise en page et
 * qu'un `Tab` depuis le champ précédent l'ignore.
 */
export const Invisible: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Stack spacing={2}>
        <Typography variant="body2">
          Un champ visible, pour comparer. Le leurre est juste en dessous, hors de l&apos;écran.
        </Typography>
        <input aria-label="Champ visible" placeholder="Champ visible" />
        <HoneypotField {...args} value={value} onChange={setValue} />
        <Typography variant="caption" color="text.secondary">
          Valeur du leurre : {value === "" ? "(vide — un humain)" : `« ${value} » — rejeté`}
        </Typography>
      </Stack>
    );
  },
};
