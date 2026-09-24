import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { LocalizedNavigate } from "../i18n/LocalizedNavigate";
import { RequireAuth } from "../routing/guards";

export const LOL_ROOT = "/lol";

const LolLandingPage = lazy(() => import("./pages/LolLandingPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const TeamsPage = lazy(() => import("./pages/TeamsPage"));

/** Les routes de l'application League of Legends, montées sous /lol. */
export function LolRoutes() {
  return (
    <Routes>
      {/* Publique : l'examinateur du portail développeur Riot doit voir le produit sans compte. */}
      <Route index element={<LolLandingPage />} />
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
      <Route
        path="teams/:id"
        element={
          <RequireAuth>
            <TeamPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<LocalizedNavigate to={LOL_ROOT} replace />} />
    </Routes>
  );
}
