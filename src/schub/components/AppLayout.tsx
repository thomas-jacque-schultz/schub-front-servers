import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import {
  Alert,
  AppShell,
  pathWithoutLanguage,
  PageErrorBoundary,
  Stack,
  useAuthStore,
  useLocalizedNavigate,
  useLocalizedPath,
  useProfileStore,
  type AppShellAccount,
  type AppShellFooterLink,
  type AppShellNavEntry,
} from "../../common";
import { PORTFOLIO } from "../content/portfolio";
import { SECTIONS, visibleTabs } from "../sections";

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
  // Mon profil est commun aux deux applications : le bandeau de Schub ne lui revient pas.
  const surProfil = route === "/profile";

  const sectionCourante = (path: string) =>
    route === path || route.startsWith(`${path}/`);

  const schubNav: AppShellNavEntry[] = [
    { key: "home", label: t("shell.home"), to: localize("/") },
    ...SECTIONS.filter(
      (section) => visibleTabs(section, canAny).length > 0,
    ).map((section) => ({
      key: section.key,
      label: t(section.labelKey),
      to: localize(section.path),
      current: sectionCourante(section.path),
    })),
  ];

  const account: AppShellAccount | undefined = connected
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
              current: surProfil,
            },
          ],
        ],
      }
    : undefined;

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
      to: localize("/feedback"),
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

  const page = <PageErrorBoundary>{children}</PageErrorBoundary>;

  return (
    <AppShell
      brand={t("app.name")}
      brandTo={localize("/")}
      brandTagline={t("app.tagline")}
      maxWidth="lg"
      navItems={surProfil ? [] : schubNav}
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
          {page}
        </Stack>
      ) : (
        page
      )}
    </AppShell>
  );
}
