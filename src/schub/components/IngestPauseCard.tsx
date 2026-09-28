import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Card,
  Stack,
  Switch,
  Text,
  messageOf,
  useAuthStore,
  useLocaleFormat,
} from "../../common";
import { getIngestPauseApi, updateIngestPauseApi } from "../api/ingestApi";
import type { IngestPauseDto } from "../types/ingest";

const RELEVE_MS = 3000;

interface IngestPauseCardProps {
  pause: IngestPauseDto;
  onChange: (pause: IngestPauseDto) => void;
}

export function IngestPauseCard({ pause, onChange }: IngestPauseCardProps) {
  const { t } = useTranslation("riot");
  const { can } = useAuthStore();
  const { formatDateTime } = useLocaleFormat();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Tant que des tâches finissent, on relève : la maintenance attend qu'il n'y en ait plus.
  useEffect(() => {
    if (!pause.paused || pause.running === 0) {
      return;
    }
    const minuteur = window.setTimeout(() => {
      getIngestPauseApi()
        .then(onChange)
        .catch(() => undefined);
    }, RELEVE_MS);
    return () => window.clearTimeout(minuteur);
  }, [pause, onChange]);

  const toggle = async (paused: boolean) => {
    setIsSaving(true);
    setError("");
    try {
      onChange(await updateIngestPauseApi(paused));
    } catch (erreur) {
      setError(messageOf(erreur, t("ingest.pause.failed")));
    } finally {
      setIsSaving(false);
    }
  };

  const etat = !pause.paused
    ? t("ingest.pause.active")
    : pause.running > 0
      ? t("ingest.pause.draining", { count: pause.running })
      : t("ingest.pause.stopped", {
          since: pause.updatedAt
            ? formatDateTime(new Date(pause.updatedAt))
            : "—",
        });

  return (
    <Card
      title={t("ingest.pause.title")}
      description={t("ingest.pause.description")}
    >
      <Stack spacing={2}>
        <Switch
          checked={pause.paused}
          onChange={(paused) => void toggle(paused)}
          label={t("ingest.pause.toggle")}
          helperText={t("ingest.pause.toggleHelper")}
          disabled={isSaving || !can("INGEST_MANAGE")}
        />
        <Text tone={pause.paused ? "primary" : "secondary"}>{etat}</Text>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Card>
  );
}
