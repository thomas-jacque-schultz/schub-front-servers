import { useTranslation } from "react-i18next";
import { PieChart } from "../../../common";
import { useStatsFormat } from "./statsFormat";

interface QueueFigure {
  key: string;
  games: number;
  winRate: number | null;
}

export function QueuePie({
  queues,
  label,
}: {
  queues: QueueFigure[];
  label: string;
}) {
  const { t } = useTranslation("stats");
  const format = useStatsFormat();
  const detail = (games: number, rate: number | null) =>
    t("queuePie.detail", { count: games, rate: format.taux(rate) });
  return (
    <PieChart
      label={label}
      emptyLabel={t("queuePie.empty")}
      otherLabel={t("queuePie.other")}
      otherDetail={(reste) =>
        t("queuePie.otherDetail", {
          count: reste.reduce((somme, part) => somme + part.value, 0),
        })
      }
      slices={queues.map((queue) => ({
        key: queue.key,
        label: format.file(queue.key),
        value: queue.games,
        detail: detail(queue.games, queue.winRate),
      }))}
    />
  );
}
