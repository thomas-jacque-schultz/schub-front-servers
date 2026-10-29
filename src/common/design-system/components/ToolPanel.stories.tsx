import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Text } from "./Text";
import { ToolPanel, type ToolPanelMenu } from "./ToolPanel";

const MENUS: ToolPanelMenu[] = [
  {
    key: "measure",
    label: "Mesure",
    tools: [{ key: "ruler", label: "Règle", icon: "ruler" }],
  },
  {
    key: "draw",
    label: "Dessin",
    tools: [
      { key: "pen", label: "Feutre", icon: "pen" },
      { key: "arrow", label: "Flèche", icon: "arrow" },
      { key: "rectangle", label: "Rectangle", icon: "rectangle" },
      { key: "ellipse", label: "Cercle", icon: "ellipse" },
      { key: "eraser", label: "Gomme", icon: "eraser" },
    ],
  },
  {
    key: "icons",
    label: "Icônes",
    tools: [{ key: "place", label: "Poser", icon: "place" }],
  },
];

function Interactive() {
  const [outil, setOutil] = useState("pen");
  return (
    <ToolPanel
      label="Outils"
      menus={MENUS}
      value={outil}
      onChange={setOutil}
      actions={
        <Button size="small" variant="secondary">
          Annuler
        </Button>
      }
    >
      <Text variant="caption" tone="secondary">
        Réglages de l'outil « {outil} »
      </Text>
    </ToolPanel>
  );
}

const meta = {
  title: "Données/ToolPanel",
  component: Interactive,
  decorators: [(Story) => <div style={{ maxWidth: 300 }}>{Story()}</div>],
} satisfies Meta<typeof Interactive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TroisMenus: Story = {};
