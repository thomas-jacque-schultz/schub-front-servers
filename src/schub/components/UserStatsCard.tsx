import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Columns,
  Stack,
  StatGrid,
  TrendChart,
  messageOf,
  useLocaleFormat,
  useRequest,
} from "../../common";
import { getUserStatsApi } from "../api/usersApi";
import type { ActiveUsersDto, UserStatsDto } from "../types/user";

export function UserStatsCard() {
  const { t } = useTranslation("users");
  const { formatNumber, formatDate } = useLocaleFormat();
  const { data, error } = useRequest("users/stats", getUserStatsApi);

  if (error !== null && !data) {
    return (
      <Alert severity="warning">
        {messageOf(error, t("stats.loadFailed"))}
      </Alert>
    );
  }
  if (!data) {
    return null;
  }

  const parApplication = (periode: keyof ActiveUsersDto) =>
    t("stats.byApp", {
      schub: formatNumber(data.activeByApp.schub[periode]),
      premadelab: formatNumber(data.activeByApp.premadelab[periode]),
    });

  const points = (mesure: (jour: UserStatsDto["daily"][number]) => number) =>
    data.daily.map((jour) => {
      const date = formatDate(new Date(`${jour.day}T12:00:00`));
      return {
        key: jour.day,
        label: date,
        value: mesure(jour),
        title: `${date} : ${formatNumber(mesure(jour))}`,
      };
    });

  return (
    <Card title={t("stats.title")} description={t("stats.description")}>
      <Stack spacing={2}>
        <StatGrid
          items={[
            {
              key: "total",
              label: t("stats.total"),
              value: formatNumber(data.total),
            },
            {
              key: "riot",
              label: t("stats.riotLinked"),
              value: formatNumber(data.riotLinked),
            },
            {
              key: "24h",
              label: t("stats.active24h"),
              value: formatNumber(data.active.last24h),
              hint: parApplication("last24h"),
            },
            {
              key: "7d",
              label: t("stats.active7d"),
              value: formatNumber(data.active.last7d),
              hint: parApplication("last7d"),
            },
            {
              key: "30d",
              label: t("stats.active30d"),
              value: formatNumber(data.active.last30d),
              hint: parApplication("last30d"),
            },
          ]}
        />
        <Columns minWidth={320}>
          <TrendChart
            label={t("stats.dailyActive")}
            points={points((jour) => jour.activeUsers)}
            valueHeader={t("stats.users")}
            emptyLabel={t("stats.empty")}
          />
          <TrendChart
            label={t("stats.dailySearchers")}
            points={points((jour) => jour.searchers)}
            valueHeader={t("stats.people")}
            emptyLabel={t("stats.empty")}
          />
        </Columns>
      </Stack>
    </Card>
  );
}
