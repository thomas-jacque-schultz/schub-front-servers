import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  DataTable,
  Text,
  useLocaleFormat,
  useRequest,
} from "../../common";
import { getAccountsByRankApi } from "../api/ingestApi";
import type { AccountsByRankRowDto } from "../types/ingest";

interface Row {
  key: string;
  label: string;
  tracked: number;
  seeds: number;
  total?: boolean;
}

const REGROUPES: Record<string, string> = {
  MASTER: "MASTER_GRANDMASTER",
  GRANDMASTER: "MASTER_GRANDMASTER",
};

export function AccountsByRankCard() {
  const { t } = useTranslation("riot");
  const { formatNumber } = useLocaleFormat();
  const { data } = useRequest("ingest/accounts-by-rank", getAccountsByRankApi);

  const libelle = (key: string) =>
    key === "UNRANKED"
      ? t("ingest.ranks.unranked")
      : key === "MASTER_GRANDMASTER"
        ? t("ingest.ranks.masterGrandmaster")
        : t(`tier.${key}` as "tier.IRON", { ns: "stats" });

  const lignes: Row[] = [];
  for (const { tier, tracked, seeds } of data?.rows ??
    ([] as AccountsByRankRowDto[])) {
    const key = REGROUPES[tier] ?? tier;
    const ligne = lignes.find((l) => l.key === key);
    if (ligne) {
      ligne.tracked += tracked;
      ligne.seeds += seeds;
    } else {
      lignes.push({ key, label: libelle(key), tracked, seeds });
    }
  }
  if (lignes.length > 0) {
    lignes.push({
      key: "TOTAL",
      label: t("ingest.ranks.total"),
      tracked: lignes.reduce((somme, l) => somme + l.tracked, 0),
      seeds: lignes.reduce((somme, l) => somme + l.seeds, 0),
      total: true,
    });
  }

  if (data && !data.available) {
    return (
      <Card title={t("ingest.ranks.title")}>
        <Alert severity="warning">{t("ingest.unavailable")}</Alert>
      </Card>
    );
  }

  return (
    <Card
      title={t("ingest.ranks.title")}
      description={t("ingest.ranks.description")}
    >
      <DataTable<Row>
        dense
        caption={t("ingest.ranks.title")}
        emptyTitle={t("ingest.unavailable")}
        rows={lignes}
        rowKey={(row) => row.key}
        columns={[
          {
            key: "rank",
            header: t("ingest.ranks.rank"),
            render: (row) => (
              <Text variant={row.total ? "subtitle" : "body"}>{row.label}</Text>
            ),
          },
          {
            key: "tracked",
            header: t("ingest.ranks.tracked"),
            align: "right",
            render: (row) => <Text mono>{formatNumber(row.tracked)}</Text>,
          },
          {
            key: "seeds",
            header: t("ingest.ranks.seeds"),
            align: "right",
            render: (row) => <Text mono>{formatNumber(row.seeds)}</Text>,
          },
        ]}
      />
    </Card>
  );
}
