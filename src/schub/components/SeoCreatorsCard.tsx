import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Stack,
  TextField,
  messageOf,
  useAuthStore,
  useRequest,
} from "../../common";
import { getSeoCreatorsApi, updateSeoCreatorsApi } from "../api/ingestApi";

const lignes = (texte: string) =>
  texte
    .split("\n")
    .map((ligne) => ligne.trim())
    .filter(Boolean);

/** Les créateurs de contenu mis en tête du plan du site de PremadeLab (Schub#91). */
export function SeoCreatorsCard() {
  const { t } = useTranslation("riot");
  const { can } = useAuthStore();
  const canManage = can("INGEST_MANAGE");
  const { data, error } = useRequest(
    canManage ? "ingest/seo-creators" : null,
    getSeoCreatorsApi,
  );

  const [texte, setTexte] = useState<string>("");
  const [inconnus, setInconnus] = useState<string[]>([]);
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setTexte(data.creators.join("\n"));
    }
  }, [data]);

  if (!canManage) {
    return null;
  }

  const save = async () => {
    setIsSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const enregistre = await updateSeoCreatorsApi(lignes(texte));
      setTexte(enregistre.creators.join("\n"));
      setInconnus(enregistre.unknown);
      setSaved(true);
    } catch (erreur) {
      setSaveError(messageOf(erreur, t("ingest.creators.saveFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      title={t("ingest.creators.title")}
      description={t("ingest.creators.description")}
    >
      {error !== null && !data ? (
        <Alert severity="warning">{t("ingest.unavailable")}</Alert>
      ) : (
        <Stack spacing={2}>
          <TextField
            label={t("ingest.creators.label")}
            value={texte}
            onChange={setTexte}
            helperText={t("ingest.creators.helper")}
            multiline
            minRows={4}
          />
          {saved && inconnus.length === 0 && (
            <Alert severity="success">{t("ingest.creators.saved")}</Alert>
          )}
          {inconnus.length > 0 && (
            <Alert severity="warning">
              {t("ingest.creators.unknown", { riotIds: inconnus.join(", ") })}
            </Alert>
          )}
          {saveError && <Alert severity="error">{saveError}</Alert>}
          <Stack direction="row">
            <Button
              onClick={() => void save()}
              loading={isSaving}
              disabled={!data}
            >
              {t("ingest.creators.save")}
            </Button>
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
