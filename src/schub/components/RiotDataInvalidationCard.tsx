import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  BulletList,
  Button,
  Card,
  Dialog,
  ProgressBar,
  Stack,
  Text,
  TextField,
  messageOf,
  useLocaleFormat,
} from "../../common";
import {
  getRiotDataInventoryApi,
  invalidateRiotDataApi,
} from "../api/ingestApi";
import type {
  IngestPauseDto,
  RiotDataInvalidationDto,
  RiotDataInventoryDto,
} from "../types/ingest";

const CONFIRMATION = "INVALIDER";

interface RiotDataInvalidationCardProps {
  pause: IngestPauseDto;
}

// Réservée à l'OWNER (ROLE_MANAGE) par la page ; le cœur refuse aussi tous les autres.
export function RiotDataInvalidationCard({
  pause,
}: RiotDataInvalidationCardProps) {
  const { t } = useTranslation("riot");
  const { formatNumber } = useLocaleFormat();
  const [open, setOpen] = useState<boolean>(false);
  const [inventory, setInventory] = useState<RiotDataInventoryDto | null>(null);
  const [word, setWord] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<RiotDataInvalidationDto | null>(null);

  const alArret = pause.paused && pause.running === 0;

  const ouvre = async () => {
    setError("");
    setResult(null);
    setWord("");
    setInventory(null);
    setOpen(true);
    try {
      setInventory(await getRiotDataInventoryApi());
    } catch (erreur) {
      setError(messageOf(erreur, t("ingest.invalidate.failed")));
    }
  };

  const invalide = async () => {
    setIsRunning(true);
    setError("");
    try {
      setResult(await invalidateRiotDataApi(word));
      setOpen(false);
    } catch (erreur) {
      setError(messageOf(erreur, t("ingest.invalidate.failed")));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card
      title={t("ingest.invalidate.title")}
      description={t("ingest.invalidate.description")}
    >
      <Stack spacing={2}>
        {!alArret && (
          <Alert severity="info">{t("ingest.invalidate.needsPause")}</Alert>
        )}
        {result && (
          <Alert severity="success">
            {t("ingest.invalidate.done", {
              riot: formatNumber(result.riotDocuments),
              findings: formatNumber(result.findings),
              accounts: formatNumber(result.accountsToResolve),
            })}
          </Alert>
        )}
        {error && !open && <Alert severity="error">{error}</Alert>}
        <Stack direction="row">
          <Button
            variant="danger"
            onClick={() => void ouvre()}
            disabled={!alArret}
          >
            {t("ingest.invalidate.open")}
          </Button>
        </Stack>
      </Stack>
      <Dialog
        open={open}
        title={t("ingest.invalidate.dialogTitle")}
        description={t("ingest.invalidate.dialogDescription")}
        confirmLabel={t("ingest.invalidate.confirm")}
        cancelLabel={t("ingest.invalidate.cancel")}
        onConfirm={() => void invalide()}
        onClose={() => setOpen(false)}
        confirmDisabled={word !== CONFIRMATION || !inventory?.available}
        confirmLoading={isRunning}
        destructive
      >
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {!inventory ? (
            !error && <ProgressBar label={t("ingest.invalidate.title")} />
          ) : !inventory.available ? (
            <Alert severity="warning">{t("ingest.unavailable")}</Alert>
          ) : (
            <>
              <Text variant="subtitle">{t("ingest.invalidate.goes")}</Text>
              <BulletList
                items={[
                  t("ingest.invalidate.goesRiot", {
                    value: formatNumber(inventory.riotDocuments),
                  }),
                  t("ingest.invalidate.goesFindings", {
                    value: formatNumber(inventory.findings),
                  }),
                ]}
              />
              <Text variant="subtitle">{t("ingest.invalidate.stays")}</Text>
              <BulletList
                tone="secondary"
                items={[
                  t("ingest.invalidate.staysAccounts", {
                    value: formatNumber(inventory.linkedAccounts),
                  }),
                  t("ingest.invalidate.staysSlots", {
                    value: formatNumber(inventory.teamSlots),
                  }),
                  t("ingest.invalidate.staysTeams", {
                    value: formatNumber(inventory.teams),
                  }),
                  t("ingest.invalidate.staysSettings"),
                ]}
              />
              <TextField
                label={t("ingest.invalidate.confirmLabel", {
                  word: CONFIRMATION,
                })}
                value={word}
                onChange={setWord}
              />
            </>
          )}
        </Stack>
      </Dialog>
    </Card>
  );
}
