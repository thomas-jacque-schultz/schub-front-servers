import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Typography from "@mui/material/Typography";
import { Tabs, type TabItem } from "./Tabs";

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

export const SurUnOngletAVenir: Story = {
  args: { value: "aVenir" },
};

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
