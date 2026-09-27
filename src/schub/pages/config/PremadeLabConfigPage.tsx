import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  PageHeader,
  ProgressBar,
  Stack,
  TextField,
  messageOf,
  useAuthStore,
  useRequest,
} from "../../../common";
import {
  getPremadeLabSettingsApi,
  updatePremadeLabSettingsApi,
} from "../../api/premadelabApi";

/** La configuration de PremadeLab, tenue depuis Schub. */
function PremadeLabConfigPage() {
  const { t } = useTranslation("riot");
  const { can } = useAuthStore();
  const { data, error, isLoading } = useRequest(
    "premadelab/settings",
    getPremadeLabSettingsApi,
  );

  const [budget, setBudget] = useState<string>("");
  const [fenetre, setFenetre] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      setBudget(String(data.unknownPlayerBudget));
      setFenetre(String(data.budgetWindowMinutes));
    }
  }, [data]);

  const save = async () => {
    setIsSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const enregistre = await updatePremadeLabSettingsApi({
        unknownPlayerBudget: Number(budget),
        budgetWindowMinutes: Number(fenetre),
      });
      setBudget(String(enregistre.unknownPlayerBudget));
      setFenetre(String(enregistre.budgetWindowMinutes));
      setSaved(true);
    } catch (erreur) {
      setSaveError(messageOf(erreur, t("premadelab.saveFailed")));
    } finally {
      setIsSaving(false);
    }
  };

  const valide =
    Number.isInteger(Number(budget)) &&
    Number(budget) >= 0 &&
    Number.isInteger(Number(fenetre)) &&
    Number(fenetre) >= 1;

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("ingest.eyebrow")}
        title={t("premadelab.title")}
        subtitle={t("premadelab.subtitle")}
      />
      {isLoading && !data && <ProgressBar label={t("premadelab.title")} />}
      {error !== null && !data && (
        <Alert severity="error">
          {messageOf(error, t("premadelab.loadFailed"))}
        </Alert>
      )}
      {data && (
        <Card
          title={t("premadelab.budget.title")}
          description={t("premadelab.budget.description")}
        >
          <Stack spacing={2}>
            <Stack direction="responsive" spacing={2}>
              <TextField
                label={t("premadelab.budget.players")}
                type="number"
                value={budget}
                onChange={setBudget}
                disabled={!can("INGEST_MANAGE")}
              />
              <TextField
                label={t("premadelab.budget.window")}
                type="number"
                value={fenetre}
                onChange={setFenetre}
                disabled={!can("INGEST_MANAGE")}
              />
            </Stack>
            {saved && <Alert severity="success">{t("premadelab.saved")}</Alert>}
            {saveError && <Alert severity="error">{saveError}</Alert>}
            {can("INGEST_MANAGE") && (
              <Stack direction="row">
                <Button
                  onClick={() => void save()}
                  loading={isSaving}
                  disabled={!valide}
                >
                  {t("premadelab.save")}
                </Button>
              </Stack>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default PremadeLabConfigPage;
