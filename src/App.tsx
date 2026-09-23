import { type ReactNode, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import { Card, ProgressBar, Stack } from "./design-system";
import type { AppLanguage } from "./i18n/config";
import { LocalizedNavigate } from "./i18n/LocalizedNavigate";
import { LocalizedRoot } from "./i18n/LocalizedRoot";
import { useAuthStore } from "./stores/authStore";
import type { Permission } from "./types/permission";

const ContactPage = lazy(() => import("./pages/ContactPage"));
const GameServerFormPage = lazy(() => import("./pages/GameServerFormPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LolLandingPage = lazy(() => import("./pages/lol/LolLandingPage"));
const PrivacyPage = lazy(() => import("./pages/legal/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/legal/TermsPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const StatsPage = lazy(() => import("./pages/lol/StatsPage"));
const TeamPage = lazy(() => import("./pages/lol/TeamPage"));
const TeamsPage = lazy(() => import("./pages/lol/TeamsPage"));
const DiscordConfigPage = lazy(() => import("./pages/config/DiscordConfigPage"));
const IngestConfigPage = lazy(() => import("./pages/config/IngestConfigPage"));
const PortsConfigPage = lazy(() => import("./pages/config/PortsConfigPage"));
const RolesPage = lazy(() => import("./pages/config/RolesPage"));
const ServersConfigPage = lazy(() => import("./pages/config/ServersConfigPage"));
const UsersPage = lazy(() => import("./pages/config/UsersPage"));

interface GuardProps {
  children: ReactNode;
}

function RequireAuth({ children }: GuardProps) {
  const { connected } = useAuthStore();
  return connected ? <>{children}</> : <LocalizedNavigate to="/login" replace />;
}

function RequirePermission({ anyOf, children }: GuardProps & { anyOf: Permission[] }) {
  const { connected, canAny } = useAuthStore();

  if (!connected) {
    return <LocalizedNavigate to="/login" replace />;
  }

  return canAny(...anyOf) ? <>{children}</> : <LocalizedNavigate to="/" replace />;
}

function RedirectIfAuthenticated({ children }: GuardProps) {
  const { connected } = useAuthStore();
  return connected ? <LocalizedNavigate to="/config/servers" replace /> : <>{children}</>;
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

            <Route path="dashboard" element={<LocalizedNavigate to="/config/servers" replace />} />
            <Route path="config" element={<LocalizedNavigate to="/config/servers" replace />} />

            <Route
              path="config/servers"
              element={
                <RequirePermission anyOf={["SERVER_CREATE", "SERVER_EDIT", "SERVER_INFRA_VIEW"]}>
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

            <Route
              path="lol/stats"
              element={
                <RequireAuth>
                  <StatsPage />
                </RequireAuth>
              }
            />

            {/* RequireAuth et non RequirePermission : TEAM_VIEW est à portée d'équipe, le jeton ne la porte pas. */}
            {/* Publique : l'examinateur du portail développeur Riot doit voir le produit sans compte. */}
            <Route path="lol" element={<LolLandingPage />} />
            <Route
              path="lol/teams"
              element={
                <RequireAuth>
                  <TeamsPage />
                </RequireAuth>
              }
            />
            <Route
              path="lol/teams/:id"
              element={
                <RequireAuth>
                  <TeamPage />
                </RequireAuth>
              }
            />

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
