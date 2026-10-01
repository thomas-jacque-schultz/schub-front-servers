import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { radii } from "../tokens";
import { PremadeLabMark } from "./PremadeLabMark";
import { Stack } from "./Stack";
import { Text } from "./Text";

// Les fichiers de public/premadelab, en chemins relatifs : Storybook est publié sous /storybook.
const meta = {
  title: "Identité/PremadeLab",
  component: PremadeLabMark,
} satisfies Meta<typeof PremadeLabMark>;

export default meta;
type Story = StoryObj<typeof meta>;

function Planche({
  legende,
  children,
}: {
  legende: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={1} align="center">
      {children}
      <Text variant="caption" tone="secondary" mono>
        {legende}
      </Text>
    </Stack>
  );
}

export const Logo: Story = {
  render: () => (
    <Stack direction="row" spacing={4} align="end">
      {[16, 28, 64, 160].map((taille) => (
        <Planche key={taille} legende={`${taille} px`}>
          <PremadeLabMark size={taille} />
        </Planche>
      ))}
    </Stack>
  ),
};

export const Icone: Story = {
  name: "Icône",
  render: () => (
    <Stack spacing={4}>
      <Stack direction="row" spacing={4} align="end">
        {[
          ["premadelab/favicon-32.png", 32, "favicon-32.png"],
          ["premadelab/favicon-48.png", 48, "favicon-48.png"],
          ["premadelab/favicon.svg", 96, "favicon.svg"],
          ["premadelab/apple-touch-icon.png", 180, "apple-touch-icon.png"],
        ].map(([src, taille, legende]) => (
          <Planche key={legende} legende={String(legende)}>
            <Box
              component="img"
              src={String(src)}
              alt=""
              sx={{ width: Number(taille), height: Number(taille) }}
            />
          </Planche>
        ))}
      </Stack>
      <Planche legende="og-card.png — 1200 × 630">
        <Box
          component="img"
          src="premadelab/og-card.png"
          alt=""
          sx={{ width: 600, maxWidth: "100%", borderRadius: `${radii.md}px` }}
        />
      </Planche>
    </Stack>
  ),
};

export const Splash: Story = {
  name: "Splash art",
  render: () => (
    <Stack spacing={4}>
      <Planche legende="splash.svg">
        <Box
          component="img"
          src="premadelab/splash.svg"
          alt=""
          sx={{
            width: 800,
            maxWidth: "100%",
            bgcolor: "background.default",
            borderRadius: `${radii.md}px`,
          }}
        />
      </Planche>
      <Planche legende="En fond de page, comme AppShell le pose : 12 % sur sombre, 7 % sur clair">
        <Box
          sx={{
            width: 800,
            maxWidth: "100%",
            aspectRatio: "16 / 9",
            position: "relative",
            bgcolor: "background.default",
            borderRadius: `${radii.md}px`,
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: "url(premadelab/splash.svg)",
              backgroundSize: "cover",
              backgroundPosition: "right center",
              opacity: 0.12,
            },
            "[data-mui-color-scheme='light'] &::before": { opacity: 0.07 },
          }}
        />
      </Planche>
    </Stack>
  ),
};
