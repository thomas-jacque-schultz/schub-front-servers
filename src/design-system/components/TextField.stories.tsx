import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { TextField } from "./TextField";

const meta = {
  title: "Primitives/TextField",
  component: TextField,
  args: {
    label: "Nom du serveur",
    value: "",
    helperText: "Le nom affiché aux joueurs et dans les messages du bot.",
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Champ contrôlé, pour que la saisie se teste vraiment dans Storybook. */
const Controlled = (props: React.ComponentProps<typeof TextField>) => {
  const [value, setValue] = useState(props.value);
  return <TextField {...props} value={value} onChange={setValue} />;
};

export const Vide: Story = {
  render: (args) => <Controlled {...args} />,
};

export const Rempli: Story = {
  render: (args) => <Controlled {...args} value="serveur-de-demonstration" />,
};

export const EnErreur: Story = {
  render: (args) => (
    <Controlled {...args} value="" error helperText="Ce champ est obligatoire." />
  ),
};

export const Desactive: Story = {
  render: (args) => <Controlled {...args} value="serveur-de-demonstration" disabled />,
};

/** Consultation : la valeur reste sélectionnable, ce qu'un champ désactivé interdit. */
export const LectureSeule: Story = {
  render: (args) => (
    <Controlled {...args} value="serveur-de-demonstration" readOnly helperText="Fiche en consultation." />
  ),
};

export const Multiligne: Story = {
  render: (args) => (
    <Controlled
      {...args}
      label="Description"
      value={"Deux lignes d'exemple.\nAucune donnée réelle dans ce Storybook."}
      multiline
      minRows={3}
      helperText="Visible sur la fiche publique du serveur."
    />
  ),
};

export const ListeDeroulante: Story = {
  render: (args) => (
    <Controlled {...args} label="Protocole" value="tcp" select helperText={undefined}>
      <MenuItem value="tcp">tcp</MenuItem>
      <MenuItem value="udp">udp</MenuItem>
    </Controlled>
  ),
};

export const UnFormulaire: Story = {
  render: (args) => (
    <Stack spacing={2} sx={{ maxWidth: 480 }}>
      <Controlled {...args} label="Nom" value="serveur-de-demonstration" />
      <Controlled {...args} label="Jeu" value="Jeu d'exemple" helperText={undefined} />
      <Controlled
        {...args}
        label="Joueurs max"
        type="number"
        value="10"
        helperText={undefined}
      />
    </Stack>
  ),
};
