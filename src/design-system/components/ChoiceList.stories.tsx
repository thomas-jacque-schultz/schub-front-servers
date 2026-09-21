import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { ChoiceList } from "./ChoiceList";
import { Chip } from "./Chip";
import { EmptyState } from "./EmptyState";

/**
 * Les comptes affichés ici sont **inventés** : le Storybook est public, aucune donnée réelle n'y
 * entre — ni pseudo, ni Riot ID existant.
 */
const HOMONYMES = [
  {
    id: "1",
    label: "Pseudo#EUW",
    description: "Dernière partie il y a 2 jours",
    meta: (
      <>
        <Chip label="412 parties" tone="primary" variant="outline" />
        <Chip label="Milieu" tone="neutral" variant="outline" />
      </>
    ),
  },
  {
    id: "2",
    label: "Pseudo#1234",
    description: "Dernière partie il y a 8 mois",
    meta: (
      <>
        <Chip label="3 parties" tone="neutral" variant="outline" />
        <Chip label="Support" tone="neutral" variant="outline" />
      </>
    ),
  },
  {
    id: "3",
    label: "PseudoBis#EUW",
    description: "Dernière partie hier",
    meta: <Chip label="97 parties" tone="neutral" variant="outline" />,
  },
];

const meta = {
  title: "Primitives/ChoiceList",
  component: ChoiceList,
  args: { label: "Comptes proposés", options: HOMONYMES, onSelect: () => {} },
} satisfies Meta<typeof ChoiceList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ParDefaut: Story = {};

/**
 * Le cas qui justifie le composant : trois options de libellé presque identique, qu'on ne
 * départage qu'en les comparant. Une liste déroulante n'en montrerait qu'une à la fois.
 */
export const AvecSelection: Story = {
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>("1");

    return (
      <Stack sx={{ maxWidth: 480 }}>
        <ChoiceList {...args} selectedId={selectedId} onSelect={setSelectedId} />
      </Stack>
    );
  },
};

/** Sans option, la liste laisse la place à ce qu'on lui donne — elle ne disparaît pas en silence. */
export const Vide: Story = {
  args: {
    options: [],
    empty: (
      <EmptyState
        title="Aucun compte connu ne correspond"
        description="Nos suggestions viennent des parties déjà collectées. Saisissez votre Riot ID complet."
      />
    ),
  },
};
