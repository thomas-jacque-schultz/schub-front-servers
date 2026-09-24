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

const ACCUEIL = { key: "home", label: "Accueil", to: "/" };

const SERVEURS = { key: "servers", label: "Serveurs", to: "/servers" };

// Le bandeau de l'application League of Legends : il remplace celui de Schub sous /lol.
const LOL = [
  { key: "lolPublic", label: "Présentation", to: "/lol" },
  { key: "stats", label: "Mes stats", to: "/lol/stats" },
  { key: "teams", label: "Équipes", to: "/lol/teams" },
];

const applications = (courante: "schub" | "lol") => [
  { key: "schub", label: "Schub", to: "/", current: courante === "schub" },
  {
    key: "lol",
    label: "League of Legends",
    to: "/lol",
    current: courante === "lol",
  },
];

const COMPTE = {
  label: "Compte et applications",
  caption: "Connecté : capitaine.nemo",
  groups: [
    [{ key: "profile", label: "Mon profil", to: "/profile" }],
    applications("schub"),
  ],
};

const LIENS = [
  { key: "creator", label: "Créateur", to: "/contact", accent: true },
  { key: "feedback", label: "Feedback", to: "/contact#feedback", accent: true },
  { key: "terms", label: "Conditions d'utilisation", to: "/conditions" },
  { key: "privacy", label: "Confidentialité", to: "/confidentialite" },
  {
    key: "storybook",
    label: "Design system",
    href: "/storybook",
    external: false,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://example.invalid/profil",
  },
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
    navItems: [ACCUEIL, SERVEURS, CONFIGURATION],
    connected: true,
    username: "capitaine.nemo",
    account: COMPTE,
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
          <Text tone="secondary">
            La coquille fournit l'en-tête, la gouttière et le pied de page.
          </Text>
        </Card>
      </Stack>
    ),
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connecte: Story = {};

export const Deconnecte: Story = {
  args: {
    connected: false,
    username: null,
    navItems: [ACCUEIL, SERVEURS],
    account: { label: "Applications", groups: [applications("schub")] },
  },
};

export const DroitsPartiels: Story = {
  args: {
    navItems: [
      ACCUEIL,
      SERVEURS,
      {
        ...CONFIGURATION,
        items: [{ key: "servers", label: "Serveurs", to: "/config/servers" }],
      },
    ],
  },
};

export const SansEntreeAutorisee: Story = {
  args: { navItems: [ACCUEIL, SERVEURS, { ...CONFIGURATION, items: [] }] },
};

export const ApplicationLol: Story = {
  args: {
    brandTo: "/lol",
    brandTagline: "League of Legends",
    navItems: LOL,
    account: { ...COMPTE, groups: [COMPTE.groups[0], applications("lol")] },
  },
};

export const EntreeGrisee: Story = {
  args: {
    brandTo: "/lol",
    brandTagline: "League of Legends",
    navItems: [
      LOL[0],
      { ...LOL[1], muted: true, hint: "Liez votre compte Riot pour y accéder" },
      LOL[2],
    ],
    account: { ...COMPTE, groups: [COMPTE.groups[0], applications("lol")] },
  },
};
