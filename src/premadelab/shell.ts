import { useTranslation } from "react-i18next";
import {
  useAuthStore,
  useLocalizedPath,
  useProfileStore,
  type AppShellNavItem,
} from "../common";

const ECRANS_LARGES = ["/teams", "/stats", "/players"];

/** Le bandeau de PremadeLab : ses entrées, et la largeur de ses écrans. */
export const usePremadeLabShell = (route: string) => {
  const { t } = useTranslation("lol");
  const { connected, canAny, links } = useAuthStore();
  const { profile: moi, riotLinked: riotResolu } = useProfileStore();
  // Le profil fait foi dès qu'il est chargé : le lien Riot change en cours de session.
  const riotLinked = moi ? riotResolu : links.riot;
  const localize = useLocalizedPath();

  const navItems: AppShellNavItem[] = [
    { key: "search", label: t("shell.search"), to: localize("/") },
  ];
  if (connected) {
    navItems.push({
      key: "stats",
      label: t("shell.stats"),
      to: localize("/stats"),
      muted: !riotLinked,
      hint: riotLinked ? undefined : t("shell.statsLocked"),
    });
  }
  if (connected && canAny("TEAM_CREATE", "TEAM_VIEW")) {
    navItems.push({
      key: "teams",
      label: t("shell.teams"),
      to: localize("/teams"),
    });
  }
  navItems.push({
    key: "presentation",
    label: t("shell.presentation"),
    to: localize("/presentation"),
  });

  return {
    tagline: t("shell.tagline"),
    brandTo: localize("/"),
    navItems,
    // Cinq colonnes de statistiques et un tableau de parties deviennent illisibles resserrés.
    maxWidth: ECRANS_LARGES.some((prefixe) => route.startsWith(prefixe))
      ? ("xl" as const)
      : ("lg" as const),
  };
};
