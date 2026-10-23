import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { GameThemeProvider } from "../GameThemeProvider";
import { Button } from "./Button";
import { Card } from "./Card";
import { Celebration } from "./Celebration";
import { Countdown } from "./Countdown";
import { GameBackdrop } from "./GameBackdrop";
import { GameStage } from "./GameStage";
import { GameTitle } from "./GameTitle";
import { Stack } from "./Stack";
import { SwatchButton } from "./SwatchButton";
import { Text } from "./Text";

// L'ambiance des mini-jeux (Schub#145) : chaque composant sous le thème des jeux, sur leur fond.
const meta = {
  title: "Jeux/Ambiance",
  decorators: [
    (Story) => (
      <GameThemeProvider>
        <GameBackdrop />
        <Story />
      </GameThemeProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Titre: Story = {
  render: () => (
    <GameTitle
      title="Questions pour un invocateur"
      icon="🧠"
      tagline="Quatre réponses, une seule bonne : réponds vite."
    >
      <Text mono tone="secondary">
        ABCD
      </Text>
    </GameTitle>
  ),
};

export const Chrono: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Countdown seconds={24} label="Temps restant" />
      <Countdown seconds={4} label="Temps restant" />
    </Stack>
  ),
};

export const Carte: Story = {
  render: () => (
    <Card
      title="Question 3/15 · Objets"
      actions={<Countdown seconds={12} label="Temps restant" />}
    >
      <Stack spacing={1.5}>
        <Text variant="subtitle">Combien coûte la Lame d'infini ?</Text>
        <Stack direction="row" spacing={1}>
          <Button>Lancer la partie</Button>
          <Button variant="secondary">Passer</Button>
        </Stack>
      </Stack>
    </Card>
  ),
};

export const Scene: Story = {
  render: () => (
    <GameStage ratio={4 / 3} reserve={300}>
      <canvas />
    </GameStage>
  ),
};

export const Pastilles: Story = {
  render: () => {
    const couleurs = ["#F2E9EE", "#E0576B", "#FFD23F", "#4FB783", "#5B9BE8"];
    const Pastilles = () => {
      const [choisie, setChoisie] = useState(couleurs[0]);
      return (
        <Stack direction="row" spacing={0.5}>
          {couleurs.map((c) => (
            <SwatchButton
              key={c}
              color={c}
              label={c}
              selected={c === choisie}
              onClick={() => setChoisie(c)}
            />
          ))}
        </Stack>
      );
    };
    return <Pastilles />;
  },
};

export const Confettis: Story = {
  render: () => {
    const Gerbe = () => {
      const [n, setN] = useState<number | null>(null);
      return (
        <>
          <Button onClick={() => setN((x) => (x ?? 0) + 1)}>Trouvé !</Button>
          <Celebration trigger={n} />
        </>
      );
    };
    return <Gerbe />;
  },
};
