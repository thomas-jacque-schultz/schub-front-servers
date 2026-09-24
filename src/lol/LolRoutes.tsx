import { Route, Routes } from "react-router-dom";
import { LocalizedNavigate } from "../i18n/LocalizedNavigate";
import { RequireAuth } from "../routing/guards";
import { lazyPage } from "../routing/lazyPage";

export const LOL_ROOT = "/lol";

const LolLandingPage = lazyPage(() => import("./pages/LolLandingPage"));
const StatsPage = lazyPage(() => import("./pages/StatsPage"));
const TeamPage = lazyPage(() => import("./pages/TeamPage"));
const TeamsPage = lazyPage(() => import("./pages/TeamsPage"));

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
