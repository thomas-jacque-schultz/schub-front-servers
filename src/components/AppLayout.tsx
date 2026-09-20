import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppShell, type AppShellFooterLink, type AppShellMenu } from "../design-system";
import { PORTFOLIO } from "../content/portfolio";
import { useLocalizedNavigate, useLocalizedPath } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import type { Permission } from "../types/permission";

/**
 * L'URL du profil LinkedIn — la seule fournie à ce jour.
 *
 * <p>Discord reste <strong>délibérément vide</strong> : le pied de page l'
 * affiche inertes et signalés comme à compléter, en attendant les adresses. Les retirer les
 * ferait oublier ; les inventer serait pire.</p>
 */
const LINKEDIN_URL = "https://www.linkedin.com/in/thomas-schultz-abab10181/";

/**
 * Le dépôt public, repris du contenu du portfolio — où il est **déduit** de l'origine Git et
 * signalé comme tel. Une seule source pour les deux endroits : le pied de page et la fiche
 * projet ne peuvent pas diverger.
 */
const GITHUB_URL = PORTFOLIO.fr.repositoryUrl;

/** Le Storybook est servi en statique par le nginx du front, hors du routeur React. */
const STORYBOOK_PATH = "/storybook";

/**
 * La coquille, remplie.
 *
 * <p>C'est ici, et nulle part ailleurs, que les permissions décident du menu. La règle tenue :
 * <strong>une entrée n'existe que si la permission qu'elle exige est présente</strong> — un menu
 * qui mène à un 403 est un menu de trop. Le design system, lui, ne connaît pas le modèle de
 * droits : il affiche ce qu'on lui donne.</p>
 *
 * <p>Les entrées de configuration ne se contentent pas d'exiger la permission de lecture de
 * l'écran : elles exigent celle qui rend l'écran <em>utile</em>. Un compte qui ne peut que
 * regarder la liste des serveurs n'a rien à faire dans un menu d'administration — il a la page
 * d'accueil pour ça.</p>
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { connected, profile, canAny, logout } = useAuthStore();
  const localize = useLocalizedPath();
  const navigate = useLocalizedNavigate();

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

  const footerLinks = useMemo<AppShellFooterLink[]>(
    () => [
      { key: "storybook", label: t("shell.storybook"), href: STORYBOOK_PATH, external: false },
      { key: "linkedin", label: t("shell.linkedin"), href: LINKEDIN_URL },
      { key: "discord", label: t("shell.discord"), href: null, pendingLabel: t("shell.toComplete") },
      { key: "github", label: t("shell.github"), href: GITHUB_URL },
    ],
    [t],
  );

  return (
    <AppShell
      brand={t("app.name")}
      brandTo={localize("/")}
      brandTagline={t("app.tagline")}
      navItems={[
        { key: "home", label: t("shell.home"), to: localize("/") },
        { key: "servers", label: t("shell.servers"), to: localize("/servers") },
        { key: "contact", label: t("shell.contact"), to: localize("/contact") },
      ]}
      menus={menus}
      connected={connected}
      username={profile?.username}
      connectedAsLabel={
        profile ? t("connectedAs", { ns: "auth", username: profile.username }) : undefined
      }
      signInLabel={t("signIn", { ns: "auth" })}
      signOutLabel={t("logout", { ns: "auth" })}
      onSignIn={() => navigate("/login")}
      // La déconnexion attend la réponse du BFF avant de quitter l'écran : c'est lui qui efface
      // le cookie `httpOnly`, et naviguer avant sa réponse rendrait l'utilisateur à l'accueil
      // encore authentifié. `logout` vide l'état local même en cas d'échec, donc on n'attend
      // jamais pour rien.
      onSignOut={() => {
        void logout().then(() => navigate("/", { replace: true }));
      }}
      footerLinks={footerLinks}
      footerNote={t("shell.footerNote")}
    >
      {children}
    </AppShell>
  );
}
