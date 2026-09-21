import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Typography from "@mui/material/Typography";
import { Tabs, type TabItem } from "./Tabs";

/**
 * Les libellés et les contenus sont **fictifs**. Le Storybook est public : aucune donnée réelle
 * n'y entre, pas plus un pseudo qu'un nom d'équipe existant.
 */
const ITEMS: TabItem[] = [
  { key: "premier", label: "Premier onglet" },
  { key: "deuxieme", label: "Deuxième onglet" },
  { key: "aVenir", label: "Onglet à venir", badge: "à venir" },
  { key: "indisponible", label: "Onglet désactivé", disabled: true },
];

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  args: {
    items: ITEMS,
    value: "premier",
    // Une story est un état figé : le rappel existe pour satisfaire le contrat, la variante
    // interactive plus bas est celle qui montre le changement d'onglet.
    onChange: () => {},
    ariaLabel: "Exemple de barre d'onglets",
    children: (
      <Typography variant="body2" color="text.secondary">
        Le contenu de l'onglet actif prend place ici.
      </Typography>
    ),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

/** L'étiquette « à venir » se lit sans ouvrir l'onglet : c'est sa raison d'être. */
export const SurUnOngletAVenir: Story = {
  args: { value: "aVenir" },
};

/** En situation : l'onglet actif change, et le panneau avec lui. */
export const Interactif: Story = {
  render: (args) => {
    const Demo = () => {
      const [actif, setActif] = useState<string>("premier");
      return (
        <Tabs {...args} value={actif} onChange={setActif}>
          <Typography variant="body2" color="text.secondary">
            Panneau de l'onglet « {ITEMS.find((item) => item.key === actif)?.label} ».
          </Typography>
        </Tabs>
      );
    };
    return <Demo />;
  },
};
