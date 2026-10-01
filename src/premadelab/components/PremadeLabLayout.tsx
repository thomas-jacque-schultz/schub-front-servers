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
} from "../../common";
import { SUPPORT_URL, usePremadeLabShell } from "../shell";

const GITHUB_URL = "https://github.com/thomas-jacque-schultz";

export function PremadeLabLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const {
    connected,
    profile,
    logout,
    discordLoginFailed,
    dismissDiscordLoginFailure,
  } = useAuthStore();
  const { profile: moi } = useProfileStore();
  const localize = useLocalizedPath();
  const navigate = useLocalizedNavigate();
  const { pathname } = useLocation();

  const route = pathWithoutLanguage(pathname);
  const shell = usePremadeLabShell(route);
  const surProfil = route === "/profile";
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
      key: "feedback",
      label: t("shell.feedback"),
      to: localize("/contact"),
      accent: true,
    },
    {
      key: "support",
      label: t("shell.support", { ns: "lol" }),
      href: SUPPORT_URL,
      accent: true,
    },
    { key: "terms", label: t("shell.terms"), to: localize("/terms") },
    { key: "privacy", label: t("shell.privacy"), to: localize("/privacy") },
    { key: "github", label: t("shell.github"), href: GITHUB_URL },
  ];

  const page = <PageErrorBoundary>{children}</PageErrorBoundary>;

  return (
    <AppShell
      brand={t("shell.appPremadelab")}
      brandTo={shell.brandTo}
      brandTagline={shell.tagline}
      maxWidth={shell.maxWidth}
      navItems={surProfil ? [] : shell.navItems}
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
      footerNote={t("shell.footerNote", { ns: "lol" })}
    >
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
