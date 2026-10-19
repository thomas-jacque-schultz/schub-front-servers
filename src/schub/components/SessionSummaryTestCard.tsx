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

// Discord met en gras ce qui est entre ** ; l’aperçu se contente du texte.
const sansGras = (texte: string) => texte.split("**").join("");

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

  const send = async (envoyer: boolean) => {
    setIsSending(true);
    setResultat(null);
    setSendError("");
    try {
      setResultat(await sendSessionSummaryTestApi(choisi, envoyer));
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
          {resultat && !resultat.embeds && (
            <Alert severity="info">{t("premadelab.summaryTest.empty")}</Alert>
          )}
          {resultat?.status && (
            <Alert severity={SEVERITE[resultat.status]}>
              {t(`premadelab.summaryTest.status.${resultat.status}`)}
              {resultat.detail ? ` (${resultat.detail})` : ""}
            </Alert>
          )}
          {resultat?.embeds?.map((encadre, i) => (
            <Frame key={i} accent>
              <Stack spacing={1.5}>
                <Stack spacing={0.5}>
                  <Text variant="section">{encadre.title}</Text>
                  {encadre.description && (
                    <Text variant="caption" tone="secondary">
                      {encadre.description}
                    </Text>
                  )}
                </Stack>
                {encadre.fields.map((champ, j) => (
                  <Stack key={j} spacing={0.25}>
                    <Text variant="subtitle">{sansGras(champ.name)}</Text>
                    {champ.value.split("\n").map((ligne, k) => (
                      <Text key={k} variant="caption">
                        {sansGras(ligne)}
                      </Text>
                    ))}
                  </Stack>
                ))}
                {encadre.footer && (
                  <Text variant="caption" tone="secondary">
                    {encadre.footer.text}
                  </Text>
                )}
              </Stack>
            </Frame>
          ))}
          <Stack direction="row" spacing={1}>
            <Button
              variant="secondary"
              onClick={() => void send(false)}
              loading={isSending}
              disabled={!choisi}
            >
              {t("premadelab.summaryTest.preview")}
            </Button>
            <Button
              onClick={() => void send(true)}
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
