import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Stack,
  TextField,
  getHistoryWindowApi,
  messageOf,
  useAuthStore,
  useRequest,
} from "../../common";
import { updateHistoryWindowApi } from "../api/ingestApi";

const entier = (valeur: string, min: number, max: number) => {
  const nombre = Number(valeur);
  return Number.isInteger(nombre) && nombre >= min && nombre <= max;
};

export function HistoryWindowCard() {
  const { t } = useTranslation("riot");
  const { can } = useAuthStore();
  const canManage = can("INGEST_MANAGE");
  const { data, error } = useRequest(
    "players/history-window",
    getHistoryWindowApi,
  );

  const [maxGames, setMaxGames] = useState<string>("");
  const [maxAgeDays, setMaxAgeDays] = useState<string>("");
  const [minGames, setMinGames] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setMaxGames(String(data.maxGames));
      setMaxAgeDays(String(data.maxAgeDays));
      setMinGames(String(data.minGames));
    }
  }, [data]);

  const valide =
    entier(maxGames, 1, 1000) &&
    entier(maxAgeDays, 1, 730) &&
    entier(minGames, 0, Number(maxGames));

  const save = async () => {
    setIsSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const enregistre = await updateHistoryWindowApi({
        maxGames: Number(maxGames),
        maxAgeDays: Number(maxAgeDays),
        minGames: Number(minGames),
      });
      setMaxGames(String(enregistre.maxGames));
      setMaxAgeDays(String(enregistre.maxAgeDays));
      setMinGames(String(enregistre.minGames));
      setSaved(true);
    } catch (erreur) {
      setSaveError(messageOf(erreur, t("ingest.window.saveFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      title={t("ingest.window.title")}
      description={t("ingest.window.description")}
    >
      {error !== null && !data ? (
        <Alert severity="warning">{t("ingest.unavailable")}</Alert>
      ) : (
        <Stack spacing={2}>
          <Stack direction="responsive" spacing={2}>
            <TextField
              label={t("ingest.window.maxGames")}
              type="number"
              value={maxGames}
              onChange={setMaxGames}
              disabled={!canManage}
            />
            <TextField
              label={t("ingest.window.maxAgeDays")}
              type="number"
              value={maxAgeDays}
              onChange={setMaxAgeDays}
              disabled={!canManage}
            />
            <TextField
              label={t("ingest.window.minGames")}
              type="number"
              value={minGames}
              onChange={setMinGames}
              helperText={t("ingest.window.minGamesHelper")}
              disabled={!canManage}
            />
          </Stack>
          {saved && (
            <Alert severity="success">{t("ingest.window.saved")}</Alert>
          )}
          {saveError && <Alert severity="error">{saveError}</Alert>}
          {canManage && (
            <Stack direction="row">
              <Button
                onClick={() => void save()}
                loading={isSaving}
                disabled={!valide || !data}
              >
                {t("ingest.window.save")}
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Card>
  );
}
