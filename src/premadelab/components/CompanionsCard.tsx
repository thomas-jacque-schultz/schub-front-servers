import { useTranslation } from "react-i18next";
import {
  Button,
  InsightCard,
  Link,
  Stack,
  Text,
  useAuthStore,
  useLocalizedNavigate,
  useLocalizedPath,
  useRequest,
} from "../../common";
import { getPlayerCompanionsApi } from "../api/playersApi";
import { retenirApresConnexion, retenirEquipeProposee } from "../afterLogin";
import { useStatsFormat } from "../pages/stats/statsFormat";

/** « Joue souvent avec » (Schub#96) : absent quand personne ne revient ; propose l'équipe quand un premade se dessine. */
export function CompanionsCard({
  slug,
  riotId,
}: {
  slug: string;
  riotId: string;
}) {
  const { t } = useTranslation("lol");
  const format = useStatsFormat();
  const navigate = useLocalizedNavigate();
  const chemin = useLocalizedPath();
  const { connected } = useAuthStore();
  const { data } = useRequest(`companions/${slug}`, () =>
    getPlayerCompanionsApi(slug),
  );

  if (!data || data.companions.length === 0) {
    return null;
  }
  const premier = data.companions[0];

  const creer = () => {
    retenirEquipeProposee([riotId, ...data.suggestedTeam]);
    if (connected) {
      navigate("/teams");
    } else {
      retenirApresConnexion("/teams");
      navigate("/login");
    }
  };

  return (
    <InsightCard
      title={t("companions.title")}
      conclusion={t("companions.conclusion", {
        player: premier.riotId,
        count: premier.games,
      })}
      visual={
        <Stack spacing={1}>
          {data.companions.map((compagnon) => (
            <Stack
              key={compagnon.riotId}
              direction="row"
              spacing={1}
              align="center"
              wrap
            >
              <Link
                href={chemin(`/players/${encodeURIComponent(compagnon.slug)}`)}
              >
                {compagnon.riotId}
              </Link>
              <Text variant="caption" mono>
                {t("companions.line", {
                  count: compagnon.games,
                  rate: format.taux(compagnon.winRate),
                })}
              </Text>
              <Text variant="caption" tone="secondary">
                {compagnon.withoutWinRate === null
                  ? t("companions.tooEarly")
                  : t("companions.without", {
                      delta: format.ecartEnPoints(
                        compagnon.winRate - compagnon.withoutWinRate,
                      ),
                    })}
              </Text>
            </Stack>
          ))}
          {data.suggestedTeam.length > 0 && (
            <Stack direction="responsive" spacing={2} align="center">
              <Text variant="subtitle">{t("companions.teamTime")}</Text>
              <Button onClick={creer}>{t("companions.teamAction")}</Button>
            </Stack>
          )}
        </Stack>
      }
      details={
        <Text variant="caption" tone="secondary">
          {t("companions.method", { count: data.minimumGames })}
        </Text>
      }
      detailsLabel={t("companions.details")}
    />
  );
}
