import { useTranslation } from "react-i18next";
import type { AppShellNavItem } from "../design-system";
import { useLocalizedPath } from "../i18n/navigation";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import { LOL_ROOT } from "./LolRoutes";

const ECRANS_LARGES = ["/lol/teams", "/lol/stats"];

/** Le bandeau de l'application : ses entrées, et la largeur de ses écrans. */
export const useLolShell = (route: string) => {
  const { t } = useTranslation("lol");
  const { connected, canAny } = useAuthStore();
  const { riotLinked } = useProfileStore();
  const localize = useLocalizedPath();

  const navItems: AppShellNavItem[] = [
    {
      key: "presentation",
      label: t("shell.presentation"),
      to: localize(LOL_ROOT),
    },
  ];
  if (connected) {
    navItems.push({
      key: "stats",
      label: t("shell.stats"),
      to: localize("/lol/stats"),
      muted: !riotLinked,
      hint: riotLinked ? undefined : t("shell.statsLocked"),
    });
  }
  if (connected && canAny("TEAM_CREATE", "TEAM_VIEW")) {
    navItems.push({
      key: "teams",
      label: t("shell.teams"),
      to: localize("/lol/teams"),
    });
  }

  return {
    tagline: t("shell.tagline"),
    brandTo: localize(LOL_ROOT),
    navItems,
    // Cinq colonnes de statistiques et un tableau de parties deviennent illisibles resserrés.
    maxWidth: ECRANS_LARGES.some((prefixe) => route.startsWith(prefixe))
      ? ("xl" as const)
      : ("lg" as const),
  };
};
