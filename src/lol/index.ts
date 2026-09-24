// La seule porte d'entrée de l'application League of Legends pour le reste du front (règle ESLint) :
// le jour où elle devient une application à part, c'est cette liste qui dit ce que Schub lui emprunte.
export { LOL_ROOT, LolRoutes } from "./LolRoutes";
export { useLolShell } from "./shell";
export { getMyTeamsApi, claimTeamsApi } from "./api/teamsApi";
export type { TeamSummaryDto } from "./types/team";
export { RiotAccountPicker } from "./components/RiotAccountPicker";
export { RiotDisclaimer } from "./components/RiotDisclaimer";
