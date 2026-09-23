import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStatsRefreshApi, refreshTeamStatsApi } from "../../../api/statsApi";
import { Button, Toast } from "../../../design-system";

export interface StatsRefreshButtonProps {
  teamId: string;
}

// Le délai est tenu par le cœur ; l'écran ne fait que l'afficher.
export function StatsRefreshButton({ teamId }: StatsRefreshButtonProps) {
  const { t } = useTranslation("stats");
  const [prochaine, setProchaine] = useState<number | null>(null);
  const [maintenant, setMaintenant] = useState<number>(Date.now());
  const [enCours, setEnCours] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; severity: "success" | "error" } | null>(
    null,
  );

  useEffect(() => {
    getStatsRefreshApi(teamId)
      .then((reponse) =>
        setProchaine(reponse.nextAllowedAt ? Date.parse(reponse.nextAllowedAt) : null),
      )
      .catch(() => setProchaine(null));
  }, [teamId]);

  const restant = prochaine === null ? 0 : Math.max(0, Math.ceil((prochaine - maintenant) / 1000));

  useEffect(() => {
    if (restant <= 0) {
      return;
    }
    const minuterie = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(minuterie);
  }, [restant]);

  const onClick = async () => {
    setEnCours(true);
    try {
      const reponse = await refreshTeamStatsApi(teamId);
      setMaintenant(Date.now());
      setProchaine(reponse.nextAllowedAt ? Date.parse(reponse.nextAllowedAt) : null);
      setMessage({
        text: reponse.triggered
          ? t("refresh.done", { count: reponse.playersQueued })
          : t("refresh.tooSoon"),
        severity: reponse.triggered ? "success" : "error",
      });
    } catch (refreshError) {
      setMessage({
        text: refreshError instanceof Error ? refreshError.message : t("refresh.failed"),
        severity: "error",
      });
    } finally {
      setEnCours(false);
    }
  };

  const minutes = Math.floor(restant / 60);
  const secondes = String(restant % 60).padStart(2, "0");

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => void onClick()}
        loading={enCours}
        disabled={restant > 0}
      >
        {restant > 0 ? t("refresh.wait", { time: `${minutes}:${secondes}` }) : t("refresh.action")}
      </Button>
      <Toast
        open={message !== null}
        message={message?.text ?? ""}
        severity={message?.severity}
        onClose={() => setMessage(null)}
        autoHideMs={8000}
      />
    </>
  );
}
