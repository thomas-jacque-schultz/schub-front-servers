import { type ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AppShell, Stack } from "../design-system";
import type { AppShellFooterLink, AppShellMenu, AppShellNavItem } from "../design-system";
import { PORTFOLIO } from "../content/portfolio";
import { useLocalizedNavigate, useLocalizedPath } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
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
  const { connected, profile, canAny, logout, discordLoginFailed, dismissDiscordLoginFailure } =
    useAuthStore();
  const { riotLinked } = useProfileStore();
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

  /**
   * Les entrées permanentes du bandeau, plus celle des équipes.
   *
   * <p>`/lol` n'est pas une page publique : elle n'apparaît que pour un compte connecté, et
   * seulement si une permission la rend utile — la règle du menu, tenue ici comme pour les
   * entrées de configuration.</p>
   *
   * <p>Elle est exigée en `TEAM_CREATE` <strong>ou</strong> `TEAM_VIEW`, et non en `TEAM_VIEW`
   * seule : cette dernière est à <em>portée d'équipe</em>, un capitaine ne la porte pas dans son
   * jeton, il la tient de son équipe (plan §A.1). L'exiger masquerait l'entrée à exactement ceux
   * qui s'en servent. `TEAM_CREATE`, elle, est globale et va à tous les rôles système.</p>
   */
  const navItems = useMemo<AppShellNavItem[]>(() => {
    const items: AppShellNavItem[] = [
      { key: "home", label: t("shell.home"), to: localize("/") },
      { key: "servers", label: t("shell.servers"), to: localize("/servers") },
      { key: "contact", label: t("shell.contact"), to: localize("/contact") },
    ];

    if (connected) {
      // À gauche d'*Équipes LoL*, et grisée tant qu'aucun compte Riot n'est lié.
      //
      // Elle n'est pas masquée : la masquer ferait croire que la fonctionnalité n'existe pas,
      // alors que ce qui manque est une action à la portée de la personne. Elle n'est pas non
      // plus désactivée : un bouton mort ne dit pas pourquoi. Grisée, expliquée au survol et à
      // la lecture, elle reste un lien — et l'écran au bout redit la raison avec le chemin vers
      // le profil, parce qu'une URL se tape à la main.
      items.push({
        key: "stats",
        label: t("shell.stats"),
        to: localize("/lol/stats"),
        muted: !riotLinked,
        hint: riotLinked ? undefined : t("shell.statsLocked"),
      });
    }

    if (connected && canAny("TEAM_CREATE", "TEAM_VIEW")) {
      items.push({ key: "lol", label: t("shell.lol"), to: localize("/lol") });
    }

    if (connected) {
      items.push({ key: "profile", label: t("shell.profile"), to: localize("/profile") });
    }

    return items;
  }, [connected, canAny, localize, riotLinked, t]);

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
      {/* L'échec de la connexion Discord s'annonce ici, et pas sur l'écran de connexion : le BFF
          renvoie le navigateur sur la page d'accueil (`DISCORD_OAUTH_POST_LOGIN_REDIRECT`, `/`
          par défaut), pas sur `/login`. Le message doit donc survivre à l'endroit où l'on
          atterrit, et la coquille est le seul endroit qui les couvre tous. */}
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
