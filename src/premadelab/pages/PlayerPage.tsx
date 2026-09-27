import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ApiError,
  Card,
  ChampionIcon,
  EmptyState,
  PageHeader,
  ProgressBar,
  SelectField,
  Stack,
  Tabs,
  Text,
  messageOf,
  useDocumentMeta,
  useLocaleFormat,
  useLocalizedNavigate,
  useProfileStore,
  useRequest,
} from "../../common";
import {
  collectPlayerApi,
  getPlayerApi,
  getPlayerGameDetailApi,
  getPlayerGamesApi,
} from "../api/playersApi";
import { JoinCta } from "../components/JoinCta";
import type { CollectLane } from "../types/player";
import { GamesPanel } from "./stats/GamesPanel";
import { PlayerStatsView } from "./stats/PlayerStatsView";
import { RankedStandings } from "./stats/RankedStandings";
import { StatsStateNote } from "./stats/StatsStateNote";
import { useWindowOptions } from "./stats/windows";

const POLL_MS = 5_000;
// La voie lente livre une partie par minute : au-delà, on cesse d'interroger. DEMARRAGE : le temps que
// la demande de collecte soit prise en compte par le connecteur.
const POLL_MAX_MS = 12 * 60_000;
const RETRY_MS = 15_000;
const DEMARRAGE_MS = 10_000;

type Onglet = "overview" | "history";

/** La page d'un joueur recherché : son profil tout de suite, ses parties au fil de leur collecte. */
function PlayerPage() {
  const { t } = useTranslation("lol");
  const { t: ts } = useTranslation("stats");
  const { formatNumber } = useLocaleFormat();
  const navigate = useLocalizedNavigate();
  const { riotId: slug = "" } = useParams();
  const { profile } = useProfileStore();
  const fenetres = useWindowOptions();

  const [periode, setPeriode] = useState<string>("");
  const [onglet, setOnglet] = useState<Onglet>("overview");
  const [lane, setLane] = useState<CollectLane | null>(null);
  const demande = useRef<string | null>(null);
  const debut = useRef<number>(Date.now());

  const {
    data: page,
    error,
    isLoading,
    reload,
  } = useRequest(slug ? `player/${slug}/${periode}` : null, () =>
    // Les rafraîchissements ne redemandent ni le rang ni les maîtrises à Riot : la carte de profil les garde.
    getPlayerApi(slug, periode, true),
  );

  const { data: profil, reload: reloadProfil } = useRequest(
    slug ? `player-profile/${slug}` : null,
    () => getPlayerApi(slug, null),
  );

  const riotId = page
    ? `${page.gameName}#${page.tagLine}`
    : slug.replace(/-([^-]*)$/, "#$1");
  useDocumentMeta({
    title: t("player.metaTitle", { riotId }),
    description: t("player.metaDescription", { riotId }),
  });

  // Son propre compte : la même page que Mes stats.
  useEffect(() => {
    if (
      page &&
      profile?.riot.riotId &&
      profile.riot.riotId.toLowerCase() === riotId.toLowerCase()
    ) {
      navigate("/stats", { replace: true });
    }
  }, [page, profile, riotId, navigate]);

  useEffect(() => {
    if (!page || page.known || demande.current === slug) {
      return;
    }
    demande.current = slug;
    debut.current = Date.now();
    collectPlayerApi(slug)
      .then((reponse) => {
        setLane(reponse.lane);
        void reload();
      })
      // Quota Riot saturé : on redemande plus tard, sans jamais l'annoncer comme un refus.
      .catch(() => {
        setTimeout(() => {
          demande.current = null;
          void reload();
        }, RETRY_MS);
      });
  }, [page, slug, reload]);

  const occupe =
    error instanceof ApiError && (error.status === 429 || error.status === 503);
  useEffect(() => {
    if (!occupe) {
      return;
    }
    const timer = setTimeout(() => void reload(), RETRY_MS);
    return () => clearTimeout(timer);
  }, [occupe, reload]);

  const collecte =
    page !== null &&
    (lane === "FAST" || lane === "SLOW") &&
    (page.collecting || Date.now() - debut.current < DEMARRAGE_MS) &&
    Date.now() - debut.current < POLL_MAX_MS;

  // La collecte finie, le profil se relit une fois : un rang refusé faute de quota arrive alors.
  const collecteAvant = useRef<boolean>(false);
  useEffect(() => {
    if (collecteAvant.current && !collecte) {
      void reloadProfil();
    }
    collecteAvant.current = collecte;
  }, [collecte, reloadProfil]);

  useEffect(() => {
    if (!collecte) {
      return;
    }
    const timer = setInterval(() => void reload(), POLL_MS);
    return () => clearInterval(timer);
  }, [collecte, reload]);

  if (error instanceof ApiError && error.status === 404) {
    return (
      <Stack spacing={3}>
        <PageHeader eyebrow={t("player.eyebrow")} title={riotId} />
        <Card>
          <EmptyState
            title={t("player.notFound.title")}
            description={t("player.notFound.description")}
            action={<Text tone="secondary">{t("player.notFound.hint")}</Text>}
          />
        </Card>
      </Stack>
    );
  }

  if (!page) {
    return error && !occupe ? (
      <Alert severity="error">{messageOf(error, t("player.loadFailed"))}</Alert>
    ) : (
      <ProgressBar label={occupe ? t("player.busy") : t("player.loading")} />
    );
  }

  const stats = page.stats;

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("player.eyebrow")}
        title={riotId}
        subtitle={t("player.subtitle")}
      />

      <JoinCta />

      <Stack direction="responsive" spacing={2} align="start">
        <Card title={t("player.ranked")}>
          <RankedStandings standings={profil?.rankings ?? []} />
        </Card>
        {profil && profil.masteries.length > 0 && (
          <Card title={t("player.masteries")}>
            <Stack direction="row" spacing={2} wrap>
              {profil.masteries.map((m) => (
                <Stack key={m.championId} spacing={0.5} align="center">
                  <ChampionIcon
                    src={m.iconUrl}
                    name={m.championName ?? String(m.championId)}
                  />
                  <Text variant="caption" mono>
                    {t("player.masteryPoints", {
                      points: formatNumber(m.points),
                    })}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Card>
        )}
      </Stack>

      {collecte && (
        <Card
          title={t("player.collecting.title")}
          description={t("player.collecting.description")}
        >
          <Stack spacing={1}>
            <ProgressBar label={t("player.collecting.title")} />
            <Text variant="caption" tone="secondary">
              {t("player.collecting.progress", { count: page.knownGames })}
            </Text>
          </Stack>
        </Card>
      )}

      <Stack direction="row" spacing={2} align="center" wrap>
        <SelectField
          label={ts("window.label")}
          value={periode}
          onChange={setPeriode}
          options={fenetres}
          helperText={ts("window.helper")}
        />
      </Stack>

      <Tabs
        items={[
          { key: "overview", label: ts("tabs.overview") },
          { key: "history", label: ts("tabs.history") },
        ]}
        value={onglet}
        onChange={(key) => setOnglet(key as Onglet)}
        ariaLabel={ts("tabs.ariaLabel")}
      >
        {onglet === "history" && (
          <GamesPanel
            requestKey={`player/${slug}/${periode}/${page.knownGames}`}
            load={() => getPlayerGamesApi(slug, periode)}
            loadDetail={(matchId) =>
              getPlayerGameDetailApi(slug, matchId, periode)
            }
            avatar={null}
          />
        )}
        {onglet === "overview" &&
          (stats.state === "STATISTIQUES_CONNUES" && stats.overall ? (
            <PlayerStatsView data={stats} />
          ) : (
            !collecte && <StatsStateNote state={stats.state} variant="block" />
          ))}
      </Tabs>
      {isLoading && (
        <Text variant="caption" tone="secondary">
          {t("player.refreshing")}
        </Text>
      )}
    </Stack>
  );
}

export default PlayerPage;
