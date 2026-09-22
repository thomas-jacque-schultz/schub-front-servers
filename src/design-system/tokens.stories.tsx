import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Card } from "./components/Card";
import {
  backdrops,
  brand,
  darkPalette,
  elevations,
  lightPalette,
  radii,
  spacingUnit,
  typographyTokens,
} from "./tokens";

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

export const Marque: Story = {
  render: () => (
    <Stack spacing={3}>
      <Card title="Or" description="L'accent. Rare par principe : l'action principale, la marque d'un graphique, les liserés.">
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Swatch name="goldBright" value={brand.goldBright} />
          <Swatch name="gold" value={brand.gold} />
          <Swatch name="goldDeep" value={brand.goldDeep} />
        </Stack>
      </Card>
      <Card title="Prune" description="Le volume : fonds, halos, surfaces, second rôle.">
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Swatch name="pruneBright" value={brand.pruneBright} />
          <Swatch name="prune" value={brand.prune} />
          <Swatch name="pruneDeep" value={brand.pruneDeep} />
          <Swatch name="pruneInk" value={brand.pruneInk} />
        </Stack>
      </Card>
      <Card title="Noir" description="Violacé et non bleuté : c'est ce qui le met dans la même famille que la prune.">
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Swatch name="obsidian" value={brand.obsidian} />
        </Stack>
      </Card>
      <Card title="Fonds de page" description="Deux halos dans les angles, et la trame par-dessus (posée par PageBackdrop).">
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Stack spacing={0.5} sx={{ width: 320 }}>
            <Box sx={{ height: 160, borderRadius: `${radii.lg}px`, border: "1px solid", borderColor: "divider", background: backdrops.dark.page }} />
            <Typography variant="caption" fontWeight={600}>backdrops.dark.page</Typography>
          </Stack>
          <Stack spacing={0.5} sx={{ width: 320 }}>
            <Box sx={{ height: 160, borderRadius: `${radii.lg}px`, border: "1px solid", borderColor: "divider", background: backdrops.light.page }} />
            <Typography variant="caption" fontWeight={600}>backdrops.light.page</Typography>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  ),
};

function luminance(hex: string): number {
  const canaux = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * canaux[0] + 0.7152 * canaux[1] + 0.0722 * canaux[2];
}

function contraste(a: string, b: string): number {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (clair + 0.05) / (sombre + 0.05);
}

function LigneContraste({ nom, avant, arriere }: { nom: string; avant: string; arriere: string }) {
  const ratio = contraste(avant, arriere);
  const verdict = ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA gros seulement" : "insuffisant";
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 132,
          px: 1,
          py: 0.5,
          background: arriere,
          color: avant,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: `${radii.sm}px`,
          fontFamily: typographyTokens.monospaceFontFamily,
          fontSize: 13,
        }}
      >
        Texte 123
      </Box>
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {nom}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontFamily: typographyTokens.monospaceFontFamily, width: 72, textAlign: "right" }}
      >
        {ratio.toFixed(2)}:1
      </Typography>
      <Typography
        variant="caption"
        sx={{ width: 150, color: ratio >= 4.5 ? "success.main" : ratio >= 3 ? "warning.main" : "error.main" }}
      >
        {verdict}
      </Typography>
    </Stack>
  );
}

export const Contrastes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Card title="Schéma sombre">
        <Stack spacing={1}>
          <LigneContraste nom="primary (or) sur le fond" avant={darkPalette.primary.main} arriere={darkPalette.background.default} />
          <LigneContraste nom="texte du bouton primaire" avant={darkPalette.primary.contrastText} arriere={darkPalette.primary.main} />
          <LigneContraste nom="texte du bouton secondaire" avant={darkPalette.secondary.contrastText} arriere={darkPalette.secondary.main} />
          <LigneContraste nom="text.primary" avant={darkPalette.text.primary} arriere={darkPalette.background.default} />
          <LigneContraste nom="text.secondary" avant={darkPalette.text.secondary} arriere={darkPalette.background.default} />
          <LigneContraste nom="text.disabled" avant={darkPalette.text.disabled} arriere={darkPalette.background.default} />
          <LigneContraste nom="success" avant={darkPalette.success.main} arriere={darkPalette.background.default} />
          <LigneContraste nom="warning (orange, pas ambre)" avant={darkPalette.warning.main} arriere={darkPalette.background.default} />
          <LigneContraste nom="error" avant={darkPalette.error.main} arriere={darkPalette.background.default} />
          <LigneContraste nom="info" avant={darkPalette.info.main} arriere={darkPalette.background.default} />
        </Stack>
      </Card>
      <Card title="Schéma clair">
        <Stack spacing={1}>
          <LigneContraste nom="primary (prune) sur papier" avant={lightPalette.primary.main} arriere={lightPalette.background.paper} />
          <LigneContraste nom="secondary (or profond) sur papier" avant={lightPalette.secondary.main} arriere={lightPalette.background.paper} />
          <LigneContraste nom="text.primary" avant={lightPalette.text.primary} arriere={lightPalette.background.default} />
          <LigneContraste nom="text.secondary" avant={lightPalette.text.secondary} arriere={lightPalette.background.default} />
          <LigneContraste nom="or de marque sur blanc — doit rester rouge" avant={brand.gold} arriere={lightPalette.background.paper} />
        </Stack>
      </Card>
    </Stack>
  ),
};

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
