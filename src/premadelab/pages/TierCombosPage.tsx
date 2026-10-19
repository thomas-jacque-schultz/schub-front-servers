import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  Alert,
  Card,
  ChampionIcon,
  DataTable,
  EmptyState,
  PageHeader,
  ProgressBar,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  messageOf,
  useDocumentMeta,
  useLocaleFormat,
  useLocalizedNavigate,
  useRequest,
} from "../../common";
import { getTierCombosApi } from "../api/combosApi";
import { JoinCta } from "../components/JoinCta";
import type {
  TierComboKind,
  TierComboLineDto,
  TierGroup,
} from "../types/combos";
import { useStatsFormat } from "./stats/statsFormat";

const PALIERS: TierGroup[] = [
  "IRON_BRONZE",
  "SILVER_GOLD",
  "PLATINUM_EMERALD",
  "DIAMOND",
  "MASTER_PLUS",
];
const TYPES: TierComboKind[] = ["ADC_SUP", "JGL_MID", "JGL_MID_SUP"];

const code = (slug: string) => slug.toUpperCase().replace(/-/g, "_");
const slug = (valeur: string) => valeur.toLowerCase().replace(/_/g, "-");

/** Les combos qui gagnent, palier par palier (Schub#112) : publique, et lue par les robots via le BFF. */
export default function TierCombosPage() {
  const { t } = useTranslation("lol");
  const format = useStatsFormat();
  const { formatDate } = useLocaleFormat();
  const navigate = useLocalizedNavigate();
  const params = useParams();
  const palier = code(params.tier ?? "") as TierGroup;
  const type = code(params.kind ?? "") as TierComboKind;
  const connue = PALIERS.includes(palier) && TYPES.includes(type);
  const { data, error, isLoading } = useRequest(
    connue ? `tier-combos/${palier}/${type}` : null,
    () => getTierCombosApi(palier, type),
  );

  const titre = connue
    ? t("combos.title", {
        kind: t(`combos.kind.${type}`),
        tier: t(`combos.tier.${palier}`),
      })
    : t("combos.unknown");
  useDocumentMeta({
    title: `${titre} | PremadeLab`,
    description: t("combos.description"),
  });

  const aller = (nouveauPalier: string, nouveauType: string) =>
    navigate(`/combos/${slug(nouveauPalier)}/${slug(nouveauType)}`);

  if (!connue) {
    return (
      <Stack spacing={3}>
        <PageHeader eyebrow={t("combos.eyebrow")} title={titre} />
        <EmptyState title={t("combos.unknown")} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("combos.eyebrow")}
        title={titre}
        subtitle={t("combos.subtitle")}
      />
      <SegmentedControl
        label={t("combos.tierLabel")}
        value={palier}
        onChange={(valeur) => aller(valeur, type)}
        options={PALIERS.map((p) => ({
          value: p,
          label: t(`combos.tier.${p}`),
        }))}
      />
      <Tabs
        items={TYPES.map((k) => ({ key: k, label: t(`combos.kind.${k}`) }))}
        value={type}
        onChange={(valeur) => aller(palier, valeur)}
        ariaLabel={t("combos.kindLabel")}
      >
        {isLoading && !data && <ProgressBar label={titre} />}
        {error !== null && !data && (
          <Alert severity="warning">
            {messageOf(error, t("combos.unavailable"))}
          </Alert>
        )}
        {data && (
          <Card
            footnote={t("combos.method", {
              games: data.games,
              minGames: data.minGames,
              date: formatDate(new Date(data.computedAt)),
            })}
          >
            <DataTable<TierComboLineDto>
              dense
              layout="fixed"
              minWidth={520}
              caption={titre}
              emptyTitle={t("combos.empty")}
              rows={data.combos}
              rowKey={(ligne) => ligne.champions.map((c) => c.id).join("-")}
              columns={[
                {
                  key: "rank",
                  header: "#",
                  width: 64,
                  render: (ligne) => (
                    <Text mono tone="secondary">
                      {data.combos.indexOf(ligne) + 1}
                    </Text>
                  ),
                },
                {
                  key: "champions",
                  header: t("combos.champions"),
                  render: (ligne) => (
                    <Stack direction="row" spacing={1} align="center" wrap>
                      {ligne.champions.map((champion, index) => (
                        <Stack
                          key={`${champion.id}-${index}`}
                          direction="row"
                          spacing={0.5}
                          align="center"
                        >
                          <ChampionIcon
                            size="small"
                            name={champion.name ?? String(champion.id)}
                            src={champion.iconUrl}
                          />
                          <Text>{champion.name ?? format.absent}</Text>
                        </Stack>
                      ))}
                    </Stack>
                  ),
                },
                {
                  key: "winRate",
                  header: t("combos.winRate"),
                  width: 120,
                  align: "right",
                  render: (ligne) => (
                    <Text mono>{format.taux(ligne.winRate)}</Text>
                  ),
                },
                {
                  key: "games",
                  header: t("combos.games"),
                  width: 100,
                  align: "right",
                  render: (ligne) => (
                    <Text mono tone="secondary">
                      {format.entier(ligne.games)}
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        )}
      </Tabs>
      <JoinCta />
    </Stack>
  );
}
