import { type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "./components/AppLayout";
import GameServerFormPage from "./pages/GameServerFormPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import DiscordConfigPage from "./pages/config/DiscordConfigPage";
import PortsConfigPage from "./pages/config/PortsConfigPage";
import RolesPage from "./pages/config/RolesPage";
import ServersConfigPage from "./pages/config/ServersConfigPage";
import UsersPage from "./pages/config/UsersPage";
import { Card, ProgressBar, Stack } from "./design-system";
import type { AppLanguage } from "./i18n/config";
import { LocalizedNavigate } from "./i18n/LocalizedNavigate";
import { LocalizedRoot } from "./i18n/LocalizedRoot";
import { useAuthStore } from "./stores/authStore";
import type { Permission } from "./types/permission";

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

/**
 * Les écrans, une fois la langue connue.
 *
 * <p>Les chemins sont **relatifs** : c'est ce qui permet au même arbre de routes de servir `/`
 * en français et `/en/…` en anglais sans dupliquer une seule déclaration.</p>
 *
 * <p>Tout passe désormais par {@link AppLayout} : l'en-tête et le pied de page sont le cadre de
 * l'application, pas un morceau recopié dans chaque page.</p>
 */
function LocalizedRoutes() {
  const { isCheckingSession } = useAuthStore();

  return (
    <AppLayout>
      {isCheckingSession ? (
        <SessionCheckScreen />
      ) : (
        <Routes>
          <Route index element={<LandingPage />} />
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

          <Route path="*" element={<LocalizedNavigate to="/" replace />} />
        </Routes>
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
