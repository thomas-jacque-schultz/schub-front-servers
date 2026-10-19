import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Frame,
  SelectField,
  Stack,
  Text,
  messageOf,
  useLocaleFormat,
  useRequest,
} from "../../common";
import {
  type RecentSessionDto,
  type SessionSummaryTestDto,
  getSessionSummaryTestSessionsApi,
  sendSessionSummaryTestApi,
} from "../api/premadelabApi";

const SEVERITE = {
  SENT: "success",
  UNREACHABLE: "warning",
  DISABLED: "warning",
  FAILED: "error",
} as const;

export function SessionSummaryTestCard() {
  const { t } = useTranslation("riot");
  const { formatDate } = useLocaleFormat();
  const { data, error } = useRequest(
    "premadelab/session-summary-test",
    getSessionSummaryTestSessionsApi,
  );

  const [jour, setJour] = useState<string>("");
  const [resultat, setResultat] = useState<SessionSummaryTestDto | null>(null);
  const [sendError, setSendError] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const parJour = new Map<string, RecentSessionDto[]>();
  (data ?? []).forEach((session) =>
    parJour.set(session.day, [...(parJour.get(session.day) ?? []), session]),
  );
  const options = [...parJour].map(([day, sessions]) => {
    const games = sessions.reduce((somme, s) => somme + s.games, 0);
    const wins = sessions.reduce((somme, s) => somme + s.wins, 0);
    return {
      value: day,
      label: t("premadelab.summaryTest.option", {
        date: formatDate(new Date(`${day}T12:00:00`)),
        team: [...new Set(sessions.map((s) => s.teamName))].join(", "),
        count: sessions.length,
        wins,
        losses: games - wins,
      }),
    };
  });
  const choisi = jour || options[0]?.value || "";

  const send = async () => {
    setIsSending(true);
    setResultat(null);
    setSendError("");
    try {
      setResultat(await sendSessionSummaryTestApi(choisi));
    } catch (erreur) {
      setSendError(messageOf(erreur, t("premadelab.summaryTest.failed")));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card
      title={t("premadelab.summaryTest.title")}
      description={t("premadelab.summaryTest.description")}
    >
      {error !== null && !data ? (
        <Alert severity="warning">
          {messageOf(error, t("premadelab.summaryTest.loadFailed"))}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {data && options.length === 0 ? (
            <Alert severity="info">{t("premadelab.summaryTest.none")}</Alert>
          ) : (
            <SelectField
              label={t("premadelab.summaryTest.session")}
              value={choisi}
              onChange={setJour}
              options={options}
              disabled={!data}
            />
          )}
          {sendError && <Alert severity="error">{sendError}</Alert>}
          {resultat && !resultat.status && (
            <Alert severity="info">{t("premadelab.summaryTest.empty")}</Alert>
          )}
          {resultat?.status && (
            <Alert severity={SEVERITE[resultat.status]}>
              {t(`premadelab.summaryTest.status.${resultat.status}`)}
              {resultat.detail ? ` (${resultat.detail})` : ""}
            </Alert>
          )}
          {resultat?.text && (
            <Frame>
              {resultat.text.split("\n").map((ligne, i) => (
                <Text key={i} variant="caption">
                  {ligne || " "}
                </Text>
              ))}
            </Frame>
          )}
          <Stack direction="row">
            <Button
              onClick={() => void send()}
              loading={isSending}
              disabled={!choisi}
            >
              {t("premadelab.summaryTest.send")}
            </Button>
          </Stack>
        </Stack>
      )}
    </Card>
  );
}
