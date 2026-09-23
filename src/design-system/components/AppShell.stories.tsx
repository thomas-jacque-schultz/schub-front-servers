import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "./AppShell";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { Stack } from "./Stack";
import { Text } from "./Text";

const CONFIGURATION = {
  key: "configuration",
  label: "Configuration",
  items: [
    { key: "servers", label: "Serveurs", to: "/config/servers" },
    { key: "ports", label: "Ports", to: "/config/ports" },
    { key: "users", label: "Utilisateurs", to: "/config/users" },
    { key: "roles", label: "Rôles", to: "/config/roles" },
    { key: "discord", label: "Salons Discord", to: "/config/discord" },
  ],
};

const LIENS = [
  { key: "terms", label: "Conditions d'utilisation", to: "/conditions" },
  { key: "privacy", label: "Confidentialité", to: "/confidentialite" },
  { key: "storybook", label: "Design system", href: "/storybook", external: false },
  { key: "linkedin", label: "LinkedIn", href: "https://example.invalid/profil" },
  { key: "discord", label: "Discord", href: null, pendingLabel: "à compléter" },
  { key: "github", label: "GitHub", href: null, pendingLabel: "à compléter" },
];

const meta = {
  title: "Structure/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: {
    brand: "Schub",
    brandTo: "/",
    brandTagline: "Pilotage de serveurs de jeu",
    navItems: [{ key: "servers", label: "Serveurs", to: "/servers" }],
    menus: [CONFIGURATION],
    connected: true,
    username: "capitaine.nemo",
    connectedAsLabel: "Connecté : capitaine.nemo",
    signInLabel: "Connexion",
    signOutLabel: "Déconnexion",
    footerLinks: LIENS,
    footerNote: "Schub — projet personnel",
    maxWidth: "lg",
    onSignIn: () => {},
    onSignOut: () => {},
    children: (
      <Stack spacing={3}>
        <PageHeader
          eyebrow="Configuration"
          title="Utilisateurs"
          subtitle="Qui a le droit de faire quoi, et sur quoi."
        />
        <Card title="Contenu de l'écran">
          <Text tone="secondary">La coquille fournit l'en-tête, la gouttière et le pied de page.</Text>
        </Card>
      </Stack>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connecte: Story = {};

export const Deconnecte: Story = {
  args: { connected: false, username: null, menus: [], connectedAsLabel: undefined },
};

export const DroitsPartiels: Story = {
  args: {
    menus: [
      {
        ...CONFIGURATION,
        items: [{ key: "servers", label: "Serveurs", to: "/config/servers" }],
      },
    ],
  },
};

export const SansEntreeAutorisee: Story = {
  args: { menus: [{ ...CONFIGURATION, items: [] }] },
};

export const EntreeGrisee: Story = {
  args: {
    navItems: [
      { key: "servers", label: "Serveurs", to: "/servers" },
      {
        key: "stats",
        label: "Mes stats",
        to: "/lol/stats",
        muted: true,
        hint: "Liez votre compte Riot pour y accéder",
      },
      { key: "lol", label: "Équipes LoL", to: "/lol" },
    ],
  },
};
