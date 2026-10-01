import { type ReactNode, Suspense, useEffect } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "./components/AppLayout";
import { SectionTabs } from "./components/SectionTabs";
import { SECTIONS } from "./sections";
import HomePage from "./pages/HomePage";
import {
  APP_URLS,
  Card,
  LocalizedNavigate,
  LocalizedRoot,
  LoginPage,
  PrivacyPage,
  ProfilePage,
  ProgressBar,
  RequireAuth,
  RequirePermission,
  Stack,
  TermsPage,
  lazyPage,
  useAuthStore,
  type AppLanguage,
} from "../common";

const ContactPage = lazyPage(() => import("./pages/ContactPage"));
const FeedbackPage = lazyPage(() => import("./pages/FeedbackPage"));
const GameServerFormPage = lazyPage(() => import("./pages/GameServerFormPage"));
const ServersPage = lazyPage(() => import("./pages/servers/ServersPage"));
const PortsPage = lazyPage(() => import("./pages/servers/PortsPage"));
const DiscordPage = lazyPage(() => import("./pages/servers/DiscordPage"));
const SettingsPage = lazyPage(() => import("./pages/premadelab/SettingsPage"));
const IngestPage = lazyPage(() => import("./pages/premadelab/IngestPage"));
const ResearchPage = lazyPage(() => import("./pages/premadelab/ResearchPage"));
const UsersPage = lazyPage(() => import("./pages/admin/UsersPage"));
const RolesPage = lazyPage(() => import("./pages/admin/RolesPage"));

const [SERVERS, PREMADELAB, ADMIN] = SECTIONS;

const LEGACY_CONFIG: Record<string, string> = {
  servers: "/servers?edit",
  ports: "/servers/ports",
  discord: "/servers/discord",
  premadelab: "/premadelab/settings",
  ingest: "/premadelab/ingest",
  users: "/admin/users",
  roles: "/admin/roles",
};

function LegacyConfigRedirect() {
  const { page = "" } = useParams<{ page: string }>();
  return <LocalizedNavigate to={LEGACY_CONFIG[page] ?? "/servers"} replace />;
}

function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { connected } = useAuthStore();
  return connected ? (
    <LocalizedNavigate to="/servers" replace />
  ) : (
    <>{children}</>
  );
}

// Les anciens liens /lol/… mènent à la même page de PremadeLab.
function PremadeLabRedirect() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const [, langue = "", reste = ""] =
      /^(\/en)?\/lol(\/.*)?$/.exec(pathname) ?? [];
    // /lol était la présentation : l'accueil de PremadeLab est désormais la recherche.
    const cible = `${langue}${reste || "/presentation"}`;
    window.location.replace(`${APP_URLS.premadelab}${cible}${search}`);
  }, [pathname, search]);

  return null;
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

            <Route path="contact" element={<ContactPage />} />
            <Route path="feedback" element={<FeedbackPage />} />

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
              element={<LocalizedNavigate to="/servers" replace />}
            />
            <Route
              path="config"
              element={<LocalizedNavigate to="/servers" replace />}
            />
            <Route path="config/:page" element={<LegacyConfigRedirect />} />

            <Route path="servers" element={<SectionTabs section={SERVERS} />}>
              <Route index element={<ServersPage />} />
              <Route
                path="ports"
                element={
                  <RequirePermission anyOf={["PORT_VIEW"]}>
                    <PortsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="discord"
                element={
                  <RequirePermission anyOf={["DISCORD_CHANNEL_MANAGE"]}>
                    <DiscordPage />
                  </RequirePermission>
                }
              />
            </Route>

            <Route
              path="premadelab"
              element={<SectionTabs section={PREMADELAB} />}
            >
              <Route
                path="settings"
                element={
                  <RequirePermission anyOf={["INGEST_VIEW"]}>
                    <SettingsPage />
                  </RequirePermission>
                }
              />
              <Route
                path="ingest"
                element={
                  <RequirePermission anyOf={["INGEST_VIEW"]}>
                    <IngestPage />
                  </RequirePermission>
                }
              />
              <Route
                path="research"
                element={
                  <RequirePermission
                    anyOf={["AUGUR_PATTERN_EDIT", "INGEST_MANAGE"]}
                  >
                    <ResearchPage />
                  </RequirePermission>
                }
              />
            </Route>

            <Route path="admin" element={<SectionTabs section={ADMIN} />}>
              <Route
                path="users"
                element={
                  <RequirePermission anyOf={["USER_VIEW"]}>
                    <UsersPage />
                  </RequirePermission>
                }
              />
              <Route
                path="roles"
                element={
                  <RequirePermission anyOf={["ROLE_MANAGE"]}>
                    <RolesPage />
                  </RequirePermission>
                }
              />
            </Route>

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

            {/* L'application League of Legends vit désormais sur son propre domaine. */}
            <Route path="lol/*" element={<PremadeLabRedirect />} />

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
