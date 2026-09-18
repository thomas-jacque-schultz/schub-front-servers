import { type ReactNode } from "react";
import { Container, LinearProgress, Stack } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardPage from "./pages/Dashboard";
import GameServerFormPage from "./pages/GameServerFormPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import { Card, PageBackdrop } from "./design-system";
import type { AppLanguage } from "./i18n/config";
import { LocalizedNavigate } from "./i18n/LocalizedNavigate";
import { LocalizedRoot } from "./i18n/LocalizedRoot";
import { useAuthStore } from "./stores/authStore";

interface GuardProps {
  children: ReactNode;
}

function RequireAuth({ children }: GuardProps) {
  const { connected } = useAuthStore();
  return connected ? <>{children}</> : <LocalizedNavigate to="/login" replace />;
}

function RequireAdmin({ children }: GuardProps) {
  const { connected, isAdmin } = useAuthStore();
  if (!connected) {
    return <LocalizedNavigate to="/login" replace />;
  }

  return isAdmin ? <>{children}</> : <LocalizedNavigate to="/dashboard" replace />;
}

function RedirectIfAuthenticated({ children }: GuardProps) {
  const { connected } = useAuthStore();
  return connected ? <LocalizedNavigate to="/dashboard" replace /> : <>{children}</>;
}

function SessionCheckScreen() {
  const { t } = useTranslation("auth");

  return (
    <PageBackdrop centered>
      <Container maxWidth="sm">
        <Card title={t("session.checking")}>
          <Stack spacing={2}>
            <LinearProgress />
          </Stack>
        </Card>
      </Container>
    </PageBackdrop>
  );
}

/**
 * Les écrans, une fois la langue connue.
 *
 * <p>Les chemins sont **relatifs** : c'est ce qui permet au même arbre de routes de servir `/`
 * en français et `/en/…` en anglais sans dupliquer une seule déclaration.</p>
 */
function LocalizedRoutes() {
  const { isCheckingSession } = useAuthStore();

  if (isCheckingSession) {
    return <SessionCheckScreen />;
  }

  return (
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
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="gameServeur/create"
        element={
          <RequireAdmin>
            <GameServerFormPage />
          </RequireAdmin>
        }
      />
      <Route
        path="gameServeur/:id/edit"
        element={
          <RequireAdmin>
            <GameServerFormPage />
          </RequireAdmin>
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
