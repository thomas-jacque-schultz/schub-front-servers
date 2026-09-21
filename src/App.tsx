import { type ReactNode, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "./components/AppLayout";
import PortfolioPage from "./pages/PortfolioPage";
import { Card, ProgressBar, Stack } from "./design-system";
import type { AppLanguage } from "./i18n/config";
import { LocalizedNavigate } from "./i18n/LocalizedNavigate";
import { LocalizedRoot } from "./i18n/LocalizedRoot";
import { useAuthStore } from "./stores/authStore";
import type { Permission } from "./types/permission";

/**
 * Le découpage du chargement — **la racine d'abord**.
 *
 * <p>Avant le chantier C, l'application tenait en un seul fichier JavaScript : ouvrir la page
 * d'accueil téléchargeait les cinq écrans d'administration, leurs formulaires et leur
 * validation. C'était sans conséquence tant que la racine servait un tableau de bord derrière
 * une authentification. Ça n'en est plus une quand elle est la racine d'un domaine personnel,
 * destinée à être indexée et partagée — y compris depuis un téléphone sur un réseau lent.</p>
 *
 * <p>Seul le portfolio est chargé d'emblée. Tout le reste arrive à la demande, y compris
 * l'état des serveurs : l'ancienne page d'accueil est devenue une section comme une autre.</p>
 */
const ContactPage = lazy(() => import("./pages/ContactPage"));
const GameServerFormPage = lazy(() => import("./pages/GameServerFormPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const TeamPage = lazy(() => import("./pages/lol/TeamPage"));
const TeamsPage = lazy(() => import("./pages/lol/TeamsPage"));
const DiscordConfigPage = lazy(() => import("./pages/config/DiscordConfigPage"));
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

/**
 * La garde par permission — le pendant du menu.
 *
 * <p>Le menu n'affiche que ce qui est autorisé, mais une URL se tape à la main et se met en
 * favori : sans cette garde, un écran refusé s'ouvrirait quand même et n'afficherait que des
 * erreurs venues du serveur. L'autorité reste le back — c'est lui qui refuse vraiment — ce qui
 * se joue ici est la lisibilité.</p>
 *
 * <p>Une seule des permissions suffit : plusieurs écrans s'ouvrent à qui détient l'une ou
 * l'autre, exactement comme les routes du BFF le prévoient.</p>
 */
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

/** L'attente d'un écran chargé à la demande. Même forme que la vérification de session. */
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

/**
 * Les écrans, une fois la langue connue.
 *
 * <p>Les chemins sont **relatifs** : c'est ce qui permet au même arbre de routes de servir la
 * racine en français et `/en/…` en anglais sans dupliquer une seule déclaration.</p>
 *
 * <p>Tout passe par {@link AppLayout} : l'en-tête et le pied de page sont le cadre de
 * l'application, pas un morceau recopié dans chaque page.</p>
 */
function LocalizedRoutes() {
  const { isCheckingSession } = useAuthStore();

  return (
    <AppLayout>
      {isCheckingSession ? (
        <SessionCheckScreen />
      ) : (
        <Suspense fallback={<RouteLoadingScreen />}>
          <Routes>
            {/* La racine est le portfolio depuis le chantier C. */}
            <Route index element={<PortfolioPage />} />

            {/* L'état des serveurs : c'était la racine jusqu'ici, c'est une section désormais.
                La page elle-même n'a pas bougé — elle ne sait pas à quelle adresse on la sert. */}
            <Route path="servers" element={<LandingPage />} />
            <Route path="contact" element={<ContactPage />} />

            <Route
              path="login"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />

            {/* L'ancien tableau de bord est devenu le menu Configuration : on garde l'adresse
                vivante pour les liens et les favoris déjà posés. */}
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

            {/* L'app d'équipe LoL (chantier D).

                RequireAuth, et non RequirePermission : TEAM_VIEW est une permission à PORTÉE
                D'ÉQUIPE — elle est accordée par l'appartenance à une équipe, pas par le rôle,
                et le jeton ne peut donc pas la porter. L'exiger ici fermerait la porte à un
                capitaine devant sa propre équipe. Le tri est fait par le cœur, qui ne sert que
                les équipes de l'appelant et refuse les autres en 403 ; le menu, lui, n'affiche
                l'entrée que si une permission la rend utile (voir AppLayout). */}
            <Route
              path="lol"
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

/**
 * Le routage de premier niveau : une branche par langue.
 *
 * <p>« Une URL par langue » se décide ici et nulle part ailleurs. Le français occupe la racine
 * parce que c'est la langue de rédaction du site ; l'anglais vit sous `/en`, ce qui le rend
 * indexable au lieu de le cacher derrière un état d'interface.</p>
 */
function App() {
  return (
    <Routes>
      <Route path="/en/*" element={<LanguageBranch language="en" />} />
      <Route path="/*" element={<LanguageBranch language="fr" />} />
    </Routes>
  );
}

export default App;
