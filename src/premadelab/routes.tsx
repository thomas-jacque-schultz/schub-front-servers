import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { destinationApresConnexion } from "./afterLogin";
import {
  LocalizedNavigate,
  LoginPage,
  PrivacyPage,
  ProfilePage,
  RequireAuth,
  TermsPage,
  lazyPage,
  useAuthStore,
  useLocalizedNavigate,
} from "../common";

const PresentationPage = lazyPage(() => import("./pages/PresentationPage"));
const SearchPage = lazyPage(() => import("./pages/SearchPage"));
const PlayerPage = lazyPage(() => import("./pages/PlayerPage"));
const StatsPage = lazyPage(() => import("./pages/StatsPage"));
const TeamPage = lazyPage(() => import("./pages/TeamPage"));
const TeamsPage = lazyPage(() => import("./pages/TeamsPage"));
const ContactPage = lazyPage(() => import("./pages/ContactPage"));
const TierCombosPage = lazyPage(() => import("./pages/TierCombosPage"));
const QueueKillerPage = lazyPage(() => import("./pages/QueueKillerPage"));
const RulerPage = lazyPage(() => import("./pages/RulerPage"));

// Le bouton « Crée ton premade » ramène sur les équipes une fois la connexion faite.
function AfterLogin() {
  const { connected } = useAuthStore();
  const navigate = useLocalizedNavigate();
  useEffect(() => {
    if (connected) {
      const cible = destinationApresConnexion();
      if (cible) {
        navigate(cible, { replace: true });
      }
    }
  }, [connected, navigate]);
  return null;
}

function LoginRoute() {
  const { connected } = useAuthStore();
  return connected ? <LocalizedNavigate to="/" replace /> : <LoginPage />;
}

export function PremadeLabRoutes() {
  return (
    <>
      <AfterLogin />
      <Routes>
        <Route index element={<SearchPage />} />
        <Route path="players/:riotId" element={<PlayerPage />} />
        {/* Publique : l'examinateur du portail développeur Riot doit voir le produit sans compte. */}
        <Route path="presentation" element={<PresentationPage />} />
        <Route
          path="combos"
          element={
            <LocalizedNavigate to="/combos/silver-gold/adc-sup" replace />
          }
        />
        <Route path="combos/:tier/:kind" element={<TierCombosPage />} />
        {/* Publique : les mini-jeux se jouent sans compte (Schub#118). */}
        <Route path="queue-killer" element={<QueueKillerPage />} />
        <Route path="queue-killer/:game" element={<QueueKillerPage />} />
        <Route path="queue-killer/:game/:room" element={<QueueKillerPage />} />
        {/* Publique : la règle ne lit rien sur le serveur. */}
        <Route path="ruler" element={<RulerPage />} />
        <Route
          path="stats"
          element={
            <RequireAuth>
              <StatsPage />
            </RequireAuth>
          }
        />
        {/* RequireAuth et non RequirePermission : TEAM_VIEW est à portée d'équipe, le jeton ne la porte pas. */}
        <Route
          path="teams"
          element={
            <RequireAuth>
              <TeamsPage />
            </RequireAuth>
          }
        />
        {/* Sans RequireAuth : un visiteur y lit la page publique, si le créateur l'a ouverte (Schub#98). */}
        <Route path="teams/:id" element={<TeamPage />} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="login" element={<LoginRoute />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<LocalizedNavigate to="/" replace />} />
      </Routes>
    </>
  );
}
