import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  ChampionIcon,
  ChampionSelector,
  Spinner,
  Stack,
  Text,
  useLocaleFormat,
  useRequest,
} from "../../../common";
import {
  chargerSorts,
  type CatalogueDeLaRegle,
  type ChampionDeLaRegle,
} from "../../rulerChampions";

export interface PorteeTracee {
  /** Ce qui a donné la portée : « Q · Orbe d'illusion ». */
  label: string;
  range: number;
}

// Tous les champions, sous la carte : en choisir un ouvre ses sorts dans la colonne de côté.
export function ChampionPicker({
  catalogue,
  isLoading,
  error,
  selected,
  onSelect,
}: {
  catalogue: CatalogueDeLaRegle | null;
  isLoading: boolean;
  error: unknown;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { t } = useTranslation("lol");
  return (
    <Card
      title={t("ruler.champions.title")}
      description={
        catalogue
          ? t("ruler.champions.description", { version: catalogue.version })
          : undefined
      }
    >
      {error ? (
        <Alert severity="warning">{t("ruler.champions.error")}</Alert>
      ) : isLoading || !catalogue ? (
        <Spinner label={t("ruler.champions.loading")} />
      ) : (
        <ChampionSelector
          entries={catalogue.champions.map((champion) => ({
            key: champion.id,
            name: champion.name,
            iconUrl: champion.icon,
          }))}
          mode="single"
          selected={selected ? [selected] : []}
          onChange={([id]) => onSelect(id ?? null)}
          searchLabel={t("ruler.champions.search")}
          noResultLabel={t("ruler.champions.noResult")}
        />
      )}
    </Card>
  );
}

// Le champion retenu : son attaque de base et ses sorts, chacun avec ses portées. Une portée se trace autour de A.
export function ChampionSpells({
  champion,
  version,
  langue,
  traced,
  onTrace,
}: {
  champion: ChampionDeLaRegle | null;
  version: string | null;
  langue: string;
  traced: PorteeTracee | null;
  onTrace: (portee: PorteeTracee) => void;
}) {
  const { t } = useTranslation("lol");
  const { formatNumber } = useLocaleFormat();
  const sorts = useRequest(
    champion && version ? `${version}/${langue}/${champion.id}` : null,
    () =>
      champion && version
        ? chargerSorts(version, langue, champion.id)
        : Promise.resolve([]),
  );

  if (!champion) {
    return (
      <Card title={t("ruler.champions.panel")}>
        <Text variant="caption" tone="secondary">
          {t("ruler.champions.pick")}
        </Text>
      </Card>
    );
  }

  const lignes = [
    {
      key: "AA",
      name: t("ruler.champions.attack"),
      icon: champion.icon,
      ranges: [champion.attackRange],
    },
    ...(sorts.data ?? []),
  ];

  return (
    <Card
      title={champion.name}
      description={t("ruler.champions.context", {
        title: champion.title,
        speed: formatNumber(champion.moveSpeed),
      })}
    >
      <Stack spacing={1.5}>
        {sorts.error ? (
          <Alert severity="warning">{t("ruler.champions.error")}</Alert>
        ) : null}
        {lignes.map((ligne) => {
          const label = t("ruler.champions.spellLabel", {
            key: ligne.key,
            name: ligne.name,
          });
          return (
            <Stack key={ligne.key} direction="row" spacing={1} align="center">
              <ChampionIcon src={ligne.icon} name={ligne.name} size="small" />
              <Stack spacing={0.5}>
                <Text variant="caption">{label}</Text>
                {ligne.ranges.length === 0 ? (
                  <Text variant="caption" tone="disabled">
                    {t("ruler.champions.noRange")}
                  </Text>
                ) : (
                  <Stack direction="row" spacing={0.5} wrap>
                    {ligne.ranges.map((range) => (
                      <Button
                        key={range}
                        size="small"
                        variant={
                          traced?.label === label && traced.range === range
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() => onTrace({ label, range })}
                      >
                        {formatNumber(range)}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Stack>
          );
        })}
        {sorts.isLoading ? (
          <Spinner label={t("ruler.champions.loading")} />
        ) : null}
      </Stack>
    </Card>
  );
}
