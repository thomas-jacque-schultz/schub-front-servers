import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AppShell, Stack } from "../design-system";
import type {
  AppShellAccount,
  AppShellAccountItem,
  AppShellFooterLink,
  AppShellNavEntry,
  AppShellNavItem,
} from "../design-system";
import { PORTFOLIO } from "../content/portfolio";
import { useLocation } from "react-router-dom";
import { pathWithoutLanguage } from "../i18n/config";
import { useLocalizedNavigate, useLocalizedPath } from "../i18n/navigation";
import { LOL_ROOT, useLolShell } from "../lol";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import type { Permission } from "../types/permission";

const LINKEDIN_URL = "https://www.linkedin.com/in/thomas-schultz-abab10181/";

const GITHUB_URL = PORTFOLIO.fr.repositoryUrl;

const STORYBOOK_PATH = "/storybook";

export function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const {
    connected,
    profile,
    canAny,
    logout,
    discordLoginFailed,
    dismissDiscordLoginFailure,
  } = useAuthStore();
  const { profile: moi } = useProfileStore();
  const localize = useLocalizedPath();
  const navigate = useLocalizedNavigate();
  const { pathname } = useLocation();

  const route = pathWithoutLanguage(pathname);
  // Deux applications, un bandeau chacune : Schub partout, League of Legends sous /lol.
  const dansLol = route === LOL_ROOT || route.startsWith(`${LOL_ROOT}/`);
  const lol = useLolShell(route);
  // Mon profil est commun aux deux applications : aucun des deux bandeaux ne lui revient.
  const surProfil = route === "/profile";

  // Pas de useMemo sur des libellés : `t` garde la même référence quand la langue change.
  const configurationEntries: Array<{
    key: string;
    label: string;
    to: string;
    permissions: Permission[];
  }> = [
    {
      key: "servers",
      label: t("shell.configServers"),
      to: "/config/servers",
      permissions: ["SERVER_CREATE", "SERVER_EDIT", "SERVER_INFRA_VIEW"],
    },
    {
      key: "ports",
      label: t("shell.configPorts"),
      to: "/config/ports",
      permissions: ["PORT_VIEW"],
    },
    {
      key: "users",
      label: t("shell.configUsers"),
      to: "/config/users",
      permissions: ["USER_VIEW"],
    },
    {
      key: "roles",
      label: t("shell.configRoles"),
      to: "/config/roles",
      permissions: ["ROLE_MANAGE"],
    },
    {
      key: "discord",
      label: t("shell.configDiscord"),
      to: "/config/discord",
      permissions: ["DISCORD_CHANNEL_MANAGE"],
    },
    {
      key: "ingest",
      label: t("shell.configIngest"),
      to: "/config/ingest",
      permissions: ["INGEST_VIEW"],
    },
  ];
  const configuration: AppShellNavItem[] = connected
    ? configurationEntries
        .filter((entry) => canAny(...entry.permissions))
        .map(({ key, label, to }) => ({ key, label, to: localize(to) }))
    : [];

  const schubNav: AppShellNavEntry[] = [
    { key: "home", label: t("shell.home"), to: localize("/") },
    { key: "servers", label: t("shell.servers"), to: localize("/servers") },
    {
      key: "configuration",
      label: t("shell.configuration"),
      items: configuration,
    },
  ];

  const applications: AppShellAccountItem[] = [
    {
      key: "schub",
      label: t("shell.appSchub"),
      to: localize("/"),
      current: !dansLol,
    },
    {
      key: "lol",
      label: t("shell.appLol"),
      to: localize(LOL_ROOT),
      current: dansLol,
    },
  ];
  const account: AppShellAccount = connected
    ? {
        label: t("shell.account"),
        caption: profile
          ? t("connectedAs", { ns: "auth", username: profile.username })
          : undefined,
        avatarUrl: moi?.discord.avatarUrl,
        groups: [
          [
            {
              key: "profile",
              label: t("shell.profile"),
              to: localize("/profile"),
              current: route === "/profile",
            },
          ],
          applications,
        ],
      }
    : { label: t("shell.apps"), groups: [applications] };

  const footerLinks: AppShellFooterLink[] = [
    {
      key: "creator",
      label: t("shell.creator"),
      to: localize("/contact"),
      accent: true,
    },
    {
      key: "feedback",
      label: t("shell.feedback"),
      to: localize("/contact#feedback"),
      accent: true,
    },
    { key: "terms", label: t("shell.terms"), to: localize("/terms") },
    { key: "privacy", label: t("shell.privacy"), to: localize("/privacy") },
    {
      key: "storybook",
      label: t("shell.storybook"),
      href: STORYBOOK_PATH,
      external: false,
    },
    { key: "linkedin", label: t("shell.linkedin"), href: LINKEDIN_URL },
    { key: "github", label: t("shell.github"), href: GITHUB_URL },
  ];

  return (
    <AppShell
      brand={t("app.name")}
      brandTo={dansLol ? lol.brandTo : localize("/")}
      brandTagline={dansLol ? lol.tagline : t("app.tagline")}
      maxWidth={dansLol ? lol.maxWidth : "lg"}
      navItems={surProfil ? [] : dansLol ? lol.navItems : schubNav}
      connected={connected}
      username={profile?.username}
      account={account}
      signInLabel={t("signIn", { ns: "auth" })}
      signOutLabel={t("logout", { ns: "auth" })}
      onSignIn={() => navigate("/login")}
      onSignOut={() => {
        void logout().then(() => navigate("/", { replace: true }));
      }}
      footerLinks={footerLinks}
      footerNote={t("shell.footerNote")}
    >
      {/* Le BFF renvoie un échec OAuth sur l'accueil, pas sur /login : le message s'affiche donc dans la coquille. */}
      {discordLoginFailed ? (
        <Stack spacing={3}>
          <Alert severity="warning" onClose={dismissDiscordLoginFailure}>
            {t("errors.discordAborted", { ns: "auth" })}
          </Alert>
          {children}
        </Stack>
      ) : (
        children
      )}
    </AppShell>
  );
}
