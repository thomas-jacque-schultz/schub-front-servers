import { useTranslation } from "react-i18next";
import {
  Card,
  ChampionIcon,
  Columns,
  EmptyState,
  InsightCard,
  Link,
  PageHeader,
  ProgressBar,
  Stack,
  Text,
  useDocumentMeta,
  useLocalizedPath,
  useRequest,
} from "../../../common";
import { getPublicTeamApi } from "../../api/teamsApi";
import { JoinCta } from "../../components/JoinCta";
import { useStatsFormat } from "../stats/statsFormat";

/** La page publique d'une équipe (Schub#98) : en lecture seule, des constats neutres ou positifs. */
export function PublicTeamView({ teamId }: { teamId: string }) {
  const { t } = useTranslation("teams");
  const format = useStatsFormat();
  const chemin = useLocalizedPath();
  const { data, error, isLoading } = useRequest(`public-team/${teamId}`, () =>
    getPublicTeamApi(teamId),
  );

  useDocumentMeta({
    title: data
      ? t("public.metaTitle", { name: data.name })
      : t("public.metaTitleUnknown"),
    description: data
      ? t("public.metaDescription", {
          name: data.name,
          count: data.games,
          rate: format.taux(data.games > 0 ? data.wins / data.games : null),
        })
      : t("public.metaTitleUnknown"),
  });

  if (isLoading && !data) {
    return <ProgressBar label={t("public.loading")} />;
  }
  if (!data || error) {
    return (
      <Stack spacing={3}>
        <Card>
          <EmptyState
            title={t("public.notFound.title")}
            description={t("public.notFound.description")}
          />
        </Card>
        <JoinCta />
      </Stack>
    );
  }

  const taux = data.games > 0 ? data.wins / data.games : null;
  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("public.eyebrow")}
        title={data.name}
        subtitle={t("public.subtitle", { count: data.members.length })}
      />
      <Columns minWidth={300} count={3}>
        <InsightCard
          title={t("public.record.title")}
          conclusion={t("public.record.conclusion", {
            count: data.games,
            rate: format.taux(taux),
          })}
          verdict={taux !== null && taux >= 0.5 ? "above" : null}
        />
        <InsightCard
          title={t("public.month.title")}
          conclusion={
            data.monthGames > 0
              ? t("public.month.conclusion", {
                  count: data.monthGames,
                  wins: data.monthWins,
                  losses: data.monthGames - data.monthWins,
                })
              : t("public.month.none")
          }
        />
        {data.bestDuo && (
          <InsightCard
            title={t("public.duo.title")}
            conclusion={t("public.duo.conclusion", {
              a: data.bestDuo.a,
              b: data.bestDuo.b,
            })}
            verdict="above"
            visual={
              <Text variant="caption" mono>
                {t("public.duo.detail", {
                  wins: data.bestDuo.wins,
                  losses: data.bestDuo.games - data.bestDuo.wins,
                  delta: format.ecartEnPoints(data.bestDuo.delta),
                })}
              </Text>
            }
          />
        )}
      </Columns>
      {data.champions.length > 0 && (
        <Card title={t("public.champions")}>
          <Stack direction="row" spacing={2} wrap>
            {data.champions.map((champion) => (
              <Stack key={champion.championId} spacing={0.5} align="center">
                <ChampionIcon src={champion.iconUrl} name={champion.name} />
                <Text variant="caption">{champion.name}</Text>
                <Text variant="caption" mono tone="secondary">
                  {t("public.championGames", { count: champion.games })}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}
      <Card title={t("public.members")}>
        <Stack spacing={0.75}>
          {data.members.map((membre, index) =>
            membre.riotId && membre.slug ? (
              <Link
                key={membre.slug}
                href={chemin(`/players/${encodeURIComponent(membre.slug)}`)}
              >
                {membre.riotId}
              </Link>
            ) : (
              <Text key={`masque-${index}`} tone="secondary">
                {t("public.hiddenMember")}
              </Text>
            ),
          )}
        </Stack>
      </Card>
      <JoinCta />
    </Stack>
  );
}
