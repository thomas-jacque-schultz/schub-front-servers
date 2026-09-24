import { type ReactNode, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import { Card, ProgressBar, Stack } from "./design-system";
import type { AppLanguage } from "./i18n/config";
import { LocalizedNavigate } from "./i18n/LocalizedNavigate";
import { LocalizedRoot } from "./i18n/LocalizedRoot";
import { LolRoutes } from "./lol";
import { RequireAuth, RequirePermission } from "./routing/guards";
import { lazyPage } from "./routing/lazyPage";
import { useAuthStore } from "./stores/authStore";

const ContactPage = lazyPage(() => import("./pages/ContactPage"));
const GameServerFormPage = lazyPage(() => import("./pages/GameServerFormPage"));
const LandingPage = lazyPage(() => import("./pages/LandingPage"));
const PrivacyPage = lazyPage(() => import("./pages/legal/PrivacyPage"));
const TermsPage = lazyPage(() => import("./pages/legal/TermsPage"));
const LoginPage = lazyPage(() => import("./pages/Login"));
const ProfilePage = lazyPage(() => import("./pages/profile/ProfilePage"));
const DiscordConfigPage = lazyPage(
  () => import("./pages/config/DiscordConfigPage"),
);
const IngestConfigPage = lazyPage(
  () => import("./pages/config/IngestConfigPage"),
);
const PortsConfigPage = lazyPage(
  () => import("./pages/config/PortsConfigPage"),
);
const RolesPage = lazyPage(() => import("./pages/config/RolesPage"));
const ServersConfigPage = lazyPage(
  () => import("./pages/config/ServersConfigPage"),
);
const UsersPage = lazyPage(() => import("./pages/config/UsersPage"));

function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { connected } = useAuthStore();
  return connected ? (
    <LocalizedNavigate to="/config/servers" replace />
  ) : (
    <>{children}</>
  );
}

function SessionCheckScreen() {
  const { t } = useTranslation("auth");

  return (
    <Stack spacing={2}>
      <Card title={t("session.checking")}>
        <ProgressBar label={t("session.checking")} />
      </Card>
    </Stack>
  );
}

function RouteLoadingScreen() {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <Card>
        <ProgressBar label={t("loading")} />
      </Card>
    </Stack>
  );
}

function LocalizedRoutes() {
  const { isCheckingSession } = useAuthStore();

  return (
    <AppLayout>
      {isCheckingSession ? (
        <SessionCheckScreen />
      ) : (
        <Suspense fallback={<RouteLoadingScreen />}>
          <Routes>
            <Route index element={<HomePage />} />

            <Route path="servers" element={<LandingPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* Exigées par Riot pour un produit tiers. */}
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />

            <Route
              path="login"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />

            <Route
              path="dashboard"
              element={<LocalizedNavigate to="/config/servers" replace />}
            />
            <Route
              path="config"
              element={<LocalizedNavigate to="/config/servers" replace />}
            />

            <Route
              path="config/servers"
              element={
                <RequirePermission
                  anyOf={["SERVER_CREATE", "SERVER_EDIT", "SERVER_INFRA_VIEW"]}
                >
                  <ServersConfigPage />
                </RequirePermission>
              }
            />
            <Route
              path="config/ports"
              element={
                <RequirePermission anyOf={["PORT_VIEW"]}>
                  <PortsConfigPage />
                </RequirePermission>
              }
            />
            <Route
              path="config/users"
              element={
                <RequirePermission anyOf={["USER_VIEW"]}>
                  <UsersPage />
                </RequirePermission>
              }
            />
            <Route
              path="config/roles"
              element={
                <RequirePermission anyOf={["ROLE_MANAGE"]}>
                  <RolesPage />
                </RequirePermission>
              }
            />
            <Route
              path="config/discord"
              element={
                <RequirePermission anyOf={["DISCORD_CHANNEL_MANAGE"]}>
                  <DiscordConfigPage />
                </RequirePermission>
              }
            />
            <Route
              path="config/ingest"
              element={
                <RequirePermission anyOf={["INGEST_VIEW"]}>
                  <IngestConfigPage />
                </RequirePermission>
              }
            />

            <Route
              path="gameServeur/create"
              element={
                <RequirePermission anyOf={["SERVER_CREATE"]}>
                  <GameServerFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="gameServeur/:id/edit"
              element={
                <RequirePermission anyOf={["SERVER_EDIT"]}>
                  <GameServerFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="gameServeur/:id/view"
              element={
                <RequireAuth>
                  <GameServerFormPage />
                </RequireAuth>
              }
            />

            <Route
              path="profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />

            <Route path="lol/*" element={<LolRoutes />} />

            <Route path="*" element={<LocalizedNavigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    </AppLayout>
  );
}

function LanguageBranch({ language }: { language: AppLanguage }) {
  return (
    <LocalizedRoot language={language}>
      <LocalizedRoutes />
    </LocalizedRoot>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/en/*" element={<LanguageBranch language="en" />} />
      <Route path="/*" element={<LanguageBranch language="fr" />} />
    </Routes>
  );
}

export default App;
