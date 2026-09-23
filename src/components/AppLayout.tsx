import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AppShell, Stack } from "../design-system";
import type { AppShellFooterLink, AppShellMenu, AppShellNavItem } from "../design-system";
import { PORTFOLIO } from "../content/portfolio";
import { useLocation } from "react-router-dom";
import { pathWithoutLanguage } from "../i18n/config";
import { useLocalizedNavigate, useLocalizedPath } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import type { Permission } from "../types/permission";

const LINKEDIN_URL = "https://www.linkedin.com/in/thomas-schultz-abab10181/";

const GITHUB_URL = PORTFOLIO.fr.repositoryUrl;

const STORYBOOK_PATH = "/storybook";

const ECRANS_LARGES = ["/lol/teams", "/lol/stats"];

export function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { connected, profile, canAny, logout, discordLoginFailed, dismissDiscordLoginFailure } =
    useAuthStore();
  const { riotLinked } = useProfileStore();
  const localize = useLocalizedPath();
  const navigate = useLocalizedNavigate();
  const { pathname } = useLocation();

  const route = pathWithoutLanguage(pathname);
  const largeur = ECRANS_LARGES.some((prefixe) => route.startsWith(prefixe)) ? "xl" : "lg";

  const menus = useMemo<AppShellMenu[]>(() => {
    if (!connected) {
      return [];
    }

    const entries: Array<{ key: string; label: string; to: string; permissions: Permission[] }> = [
      {
        key: "servers",
        label: t("shell.configServers"),
        to: "/config/servers",
        permissions: ["SERVER_CREATE", "SERVER_EDIT", "SERVER_INFRA_VIEW"],
      },
      { key: "ports", label: t("shell.configPorts"), to: "/config/ports", permissions: ["PORT_VIEW"] },
      { key: "users", label: t("shell.configUsers"), to: "/config/users", permissions: ["USER_VIEW"] },
      { key: "roles", label: t("shell.configRoles"), to: "/config/roles", permissions: ["ROLE_MANAGE"] },
      {
        key: "discord",
        label: t("shell.configDiscord"),
        to: "/config/discord",
        permissions: ["DISCORD_CHANNEL_MANAGE"],
      },
    ];

    const allowed = entries
      .filter((entry) => canAny(...entry.permissions))
      .map(({ key, label, to }) => ({ key, label, to: localize(to) }));

    return [{ key: "configuration", label: t("shell.configuration"), items: allowed }];
  }, [connected, canAny, localize, t]);

  const navItems = useMemo<AppShellNavItem[]>(() => {
    const items: AppShellNavItem[] = [
      { key: "home", label: t("shell.home"), to: localize("/") },
      { key: "servers", label: t("shell.servers"), to: localize("/servers") },
      { key: "lolPublic", label: t("shell.lolPublic"), to: localize("/lol") },
      { key: "contact", label: t("shell.contact"), to: localize("/contact") },
    ];

    if (connected) {
      items.push({
        key: "stats",
        label: t("shell.stats"),
        to: localize("/lol/stats"),
        muted: !riotLinked,
        hint: riotLinked ? undefined : t("shell.statsLocked"),
      });
    }

    if (connected && canAny("TEAM_CREATE", "TEAM_VIEW")) {
      items.push({ key: "lol", label: t("shell.lol"), to: localize("/lol/teams") });
    }

    if (connected) {
      items.push({ key: "profile", label: t("shell.profile"), to: localize("/profile") });
    }

    return items;
  }, [connected, canAny, localize, riotLinked, t]);

  const footerLinks = useMemo<AppShellFooterLink[]>(
    () => [
      { key: "terms", label: t("shell.terms"), to: localize("/terms") },
      { key: "privacy", label: t("shell.privacy"), to: localize("/privacy") },
      { key: "storybook", label: t("shell.storybook"), href: STORYBOOK_PATH, external: false },
      { key: "linkedin", label: t("shell.linkedin"), href: LINKEDIN_URL },
      { key: "discord", label: t("shell.discord"), href: null, pendingLabel: t("shell.toComplete") },
      { key: "github", label: t("shell.github"), href: GITHUB_URL },
    ],
    [localize, t],
  );

  return (
    <AppShell
      brand={t("app.name")}
      brandTo={localize("/")}
      brandTagline={t("app.tagline")}
      maxWidth={largeur}
      navItems={navItems}
      menus={menus}
      connected={connected}
      username={profile?.username}
      connectedAsLabel={
        profile ? t("connectedAs", { ns: "auth", username: profile.username }) : undefined
      }
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
