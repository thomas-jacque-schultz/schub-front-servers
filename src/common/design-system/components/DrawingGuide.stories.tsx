import type { Meta, StoryObj } from "@storybook/react";
import { DrawingGuide } from "./DrawingGuide";
import { GameStage } from "./GameStage";

// L'aperçu du feutre au-dessus d'un tableau vide : le cercle suit le curseur, la droite part du dernier point.
const meta = {
  title: "Jeux/DrawingGuide",
  component: DrawingGuide,
  args: { point: { x: 0.6, y: 0.4 }, width: 0.02, color: "#FFD23F" },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <GameStage ratio={4 / 3}>
        <DrawingGuide {...args} />
      </GameStage>
    </div>
  ),
} satisfies Meta<typeof DrawingGuide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Feutre: Story = {};

export const Droite: Story = {
  args: { from: { x: 0.2, y: 0.75 } },
};

export const Gomme: Story = {
  args: { color: undefined, width: 0.032 },
};
