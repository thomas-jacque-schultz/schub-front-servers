import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Card } from "./components/Card";
import { darkPalette, elevations, lightPalette, radii, spacingUnit, typographyTokens } from "./tokens";

const meta = {
  title: "Fondations/Tokens",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <Stack spacing={0.5} sx={{ width: 148 }}>
      <Box
        sx={{
          height: 56,
          borderRadius: `${radii.sm}px`,
          border: "1px solid",
          borderColor: "divider",
          background: value,
        }}
      />
      <Typography variant="caption" fontWeight={600}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: typographyTokens.monospaceFontFamily }}>
        {value}
      </Typography>
    </Stack>
  );
}

function PaletteBoard({ title, palette }: { title: string; palette: typeof darkPalette }) {
  return (
    <Card title={title}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Swatch name="primary" value={palette.primary.main} />
        <Swatch name="secondary" value={palette.secondary.main} />
        <Swatch name="success" value={palette.success.main} />
        <Swatch name="warning" value={palette.warning.main} />
        <Swatch name="error" value={palette.error.main} />
        <Swatch name="info" value={palette.info.main} />
        <Swatch name="background.default" value={palette.background.default} />
        <Swatch name="background.paper" value={palette.background.paper} />
        <Swatch name="background.raised" value={palette.background.raised} />
      </Stack>
    </Card>
  );
}

export const Palettes: Story = {
  render: () => (
    <Stack spacing={3}>
      <PaletteBoard title="Palette sombre (canonique)" palette={darkPalette} />
      <PaletteBoard title="Palette claire (alternative)" palette={lightPalette} />
    </Stack>
  ),
};

export const Rayons: Story = {
  render: () => (
    <Card title="Rayons de bordure">
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {Object.entries(radii).map(([name, value]) => (
          <Stack key={name} spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 96,
                height: 64,
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: `${value}px`,
              }}
            />
            <Typography variant="caption">
              {name} · {value}px
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  ),
};

export const Espacements: Story = {
  render: () => (
    <Card title={`Échelle d'espacement — un pas de ${spacingUnit}px`}>
      <Stack spacing={1}>
        {[1, 2, 3, 4, 5].map((step) => (
          <Stack key={step} direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" sx={{ width: 96 }}>
              spacing({step})
            </Typography>
            <Box sx={{ height: 12, width: step * spacingUnit, bgcolor: "primary.main", borderRadius: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {step * spacingUnit}px
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  ),
};

export const Ombres: Story = {
  render: () => (
    <Card title="Ombres">
      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        {(["sm", "md", "lg"] as const).map((name) => (
          <Stack key={name} spacing={1} alignItems="center">
            <Box
              sx={(theme) => ({
                width: 128,
                height: 80,
                borderRadius: `${radii.md}px`,
                bgcolor: "background.paper",
                boxShadow:
                  theme.palette.mode === "light" ? elevations.light[name] : elevations.dark[name],
              })}
            />
            <Typography variant="caption">{name}</Typography>
          </Stack>
        ))}
      </Stack>
    </Card>
  ),
};

export const Typographie: Story = {
  render: () => (
    <Card title="Typographie">
      <Stack spacing={1.5}>
        <Typography variant="overline" color="primary">Surtitre</Typography>
        <Typography variant="h3">Titre h3</Typography>
        <Typography variant="h4">Titre h4</Typography>
        <Typography variant="h5">Titre h5</Typography>
        <Typography variant="h6">Titre h6</Typography>
        <Typography variant="body1">
          Corps de texte : interface web pour superviser des instances et suivre leur statut.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Texte secondaire, pour une précision qui ne doit pas capter le regard.
        </Typography>
      </Stack>
    </Card>
  ),
};
