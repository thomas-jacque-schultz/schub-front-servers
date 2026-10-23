import type { Meta, StoryObj } from "@storybook/react";
import { playful } from "../tokens";
import { Columns } from "./Columns";
import { GamePoster } from "./GamePoster";

// La jaquette d'un mini-jeu dans PremadeLab : sombre sur une page claire comme sur une sombre.
const meta = {
  title: "Jeux/GamePoster",
  component: GamePoster,
  args: {
    title: "Scribble",
    icon: "🎨",
    genre: "Dessin",
    tags: ["2 à 10 joueurs", "≈ 8 min"],
    body: "Un joueur dessine un champion, les autres devinent.",
    action: "Créer un salon",
    to: "/",
    accent: playful.confetti[0],
  },
} satisfies Meta<typeof GamePoster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Seule: Story = {
  render: (args) => (
    <div style={{ maxWidth: 280 }}>
      <GamePoster {...args} />
    </div>
  ),
};

export const EnRayon: Story = {
  render: (args) => (
    <Columns count={3} minWidth={240}>
      <GamePoster {...args} />
      <GamePoster
        {...args}
        title="Zoom"
        icon="🔍"
        genre="Coup d'œil"
        tags={["2 à 10 joueurs", "≈ 5 min"]}
        body="Un champion caché sous un zoom qui recule peu à peu."
        accent={playful.confetti[2]}
      />
      <GamePoster
        {...args}
        title="In-vo-posteur"
        icon="🎭"
        genre="Bluff"
        tags={["3 à 10 joueurs", "≈ 15 min"]}
        body="Tous ont le même champion, sauf un."
        accent={playful.confetti[3]}
      />
    </Columns>
  ),
};
