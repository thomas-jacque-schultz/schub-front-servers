import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Chip,
  Columns,
  DataTable,
  PageHeader,
  SegmentedControl,
  SelectField,
  Stack,
  Switch,
  Text,
  TextField,
  Toast,
  messageOf,
  useRequest,
} from "../../../common";
import {
  getAllQuizQuestionsApi,
  type QuizQuestionDto,
  type QuizQuestionRequest,
  saveQuizQuestionApi,
} from "../../api/quizApi";

type Theme = QuizQuestionRequest["theme"];
type Langue = "fr" | "en";

const THEMES: Theme[] = ["PROS", "MONDE"];
const VIDE: QuizQuestionRequest = {
  theme: "PROS",
  date: "",
  source: "https://",
  active: true,
  fr: { enonce: "", choix: ["", "", "", ""], explication: "" },
  en: { enonce: "", choix: ["", "", "", ""], explication: "" },
};

const requeteDe = (q: QuizQuestionDto): QuizQuestionRequest => ({
  theme: q.theme,
  date: q.date,
  source: q.source,
  active: q.active,
  fr: q.fr,
  en: q.en,
});

/** La banque de questions écrites à la main du quiz (Schub#137) : l'OWNER la corrige sans redéploiement. */
function QuizBankPage() {
  const { t } = useTranslation("riot");
  const {
    data: questions,
    error,
    reload,
  } = useRequest("quiz/questions/all", getAllQuizQuestionsApi);
  const [filtre, setFiltre] = useState<"ALL" | Theme>("ALL");
  const [edition, setEdition] = useState<{
    id: string;
    neuve: boolean;
    question: QuizQuestionRequest;
  } | null>(null);
  const [toast, setToast] = useState("");

  const visibles = (questions ?? []).filter(
    (q) => filtre === "ALL" || q.theme === filtre,
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("ingest.eyebrow")}
        title={t("quizBank.title")}
        subtitle={t("quizBank.subtitle")}
      />
      {error ? (
        <Alert severity="error">
          {messageOf(error, t("quizBank.loadError"))}
        </Alert>
      ) : null}
      {edition ? (
        <Editeur
          key={edition.id || "neuve"}
          initiale={edition}
          onAnnule={() => setEdition(null)}
          onEnregistree={() => {
            setEdition(null);
            setToast(t("quizBank.saved"));
            reload();
          }}
        />
      ) : (
        <Card
          title={t("quizBank.listTitle", { n: visibles.length })}
          actions={
            <Button
              size="small"
              onClick={() =>
                setEdition({ id: "", neuve: true, question: VIDE })
              }
            >
              {t("quizBank.add")}
            </Button>
          }
        >
          <Stack spacing={2}>
            <SegmentedControl
              label={t("quizBank.filter")}
              value={filtre}
              onChange={(v) => setFiltre(v as "ALL" | Theme)}
              options={[
                { value: "ALL", label: t("quizBank.all") },
                ...THEMES.map((theme) => ({
                  value: theme,
                  label: t(`quizBank.theme.${theme}`),
                })),
              ]}
            />
            <DataTable
              caption={t("quizBank.title")}
              emptyTitle={t("quizBank.empty")}
              rows={visibles}
              rowKey={(q) => q.id}
              layout="fixed"
              columns={[
                {
                  key: "question",
                  header: t("quizBank.question"),
                  render: (q) => (
                    <Stack spacing={0.25}>
                      <Text>{q.fr.enonce}</Text>
                      <Text variant="caption" tone="secondary">
                        {q.fr.choix[0]} · {q.date}
                      </Text>
                    </Stack>
                  ),
                },
                {
                  key: "theme",
                  header: t("quizBank.themeHeader"),
                  width: 120,
                  render: (q) => t(`quizBank.theme.${q.theme}`),
                },
                {
                  key: "etat",
                  header: t("quizBank.state"),
                  width: 120,
                  render: (q) => (
                    <Chip
                      size="small"
                      tone={q.active ? "success" : "neutral"}
                      label={t(
                        q.active ? "quizBank.active" : "quizBank.inactive",
                      )}
                    />
                  ),
                },
                {
                  key: "action",
                  header: "",
                  width: 120,
                  align: "right",
                  render: (q) => (
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() =>
                        setEdition({
                          id: q.id,
                          neuve: false,
                          question: requeteDe(q),
                        })
                      }
                    >
                      {t("quizBank.edit")}
                    </Button>
                  ),
                },
              ]}
            />
          </Stack>
        </Card>
      )}
      <Toast
        open={Boolean(toast)}
        message={toast}
        onClose={() => setToast("")}
      />
    </Stack>
  );
}

function Editeur({
  initiale,
  onAnnule,
  onEnregistree,
}: {
  initiale: { id: string; neuve: boolean; question: QuizQuestionRequest };
  onAnnule: () => void;
  onEnregistree: () => void;
}) {
  const { t } = useTranslation("riot");
  const [id, setId] = useState(initiale.id);
  const [q, setQ] = useState(initiale.question);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const texte = (
    langue: Langue,
    champ: "enonce" | "explication",
    valeur: string,
  ) =>
    setQ((avant) => ({
      ...avant,
      [langue]: { ...avant[langue], [champ]: valeur },
    }));
  const choix = (langue: Langue, index: number, valeur: string) =>
    setQ((avant) => ({
      ...avant,
      [langue]: {
        ...avant[langue],
        choix: avant[langue].choix.map((c, i) => (i === index ? valeur : c)),
      },
    }));

  const enregistre = async () => {
    setEnvoi(true);
    setErreur("");
    try {
      await saveQuizQuestionApi(id.trim(), q);
      onEnregistree();
    } catch (exception) {
      setErreur(messageOf(exception, t("quizBank.saveError")));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Card
      title={
        initiale.neuve
          ? t("quizBank.newTitle")
          : t("quizBank.editTitle", { id })
      }
      description={t("quizBank.editHint")}
    >
      <Stack spacing={2}>
        {erreur && <Alert severity="error">{erreur}</Alert>}
        <Columns minWidth={200}>
          <TextField
            label={t("quizBank.id")}
            value={id}
            onChange={setId}
            readOnly={!initiale.neuve}
            helperText={initiale.neuve ? t("quizBank.idHint") : undefined}
          />
          <SelectField
            label={t("quizBank.themeHeader")}
            value={q.theme}
            onChange={(v) => setQ({ ...q, theme: v as Theme })}
            options={THEMES.map((theme) => ({
              value: theme,
              label: t(`quizBank.theme.${theme}`),
            }))}
          />
          <TextField
            label={t("quizBank.date")}
            value={q.date}
            onChange={(v) => setQ({ ...q, date: v })}
            helperText={t("quizBank.dateHint")}
          />
        </Columns>
        <TextField
          label={t("quizBank.source")}
          value={q.source}
          onChange={(v) => setQ({ ...q, source: v })}
          type="url"
          fullWidth
        />
        <Columns minWidth={320}>
          {(["fr", "en"] as Langue[]).map((langue) => (
            <Stack key={langue} spacing={1.5}>
              <Text variant="overline" tone="secondary">
                {t(`quizBank.lang.${langue}`)}
              </Text>
              <TextField
                label={t("quizBank.statement")}
                value={q[langue].enonce}
                onChange={(v) => texte(langue, "enonce", v)}
                multiline
                minRows={2}
                fullWidth
              />
              {q[langue].choix.map((c, index) => (
                <TextField
                  key={index}
                  label={t(
                    index === 0
                      ? "quizBank.rightAnswer"
                      : "quizBank.wrongAnswer",
                    {
                      n: index,
                    },
                  )}
                  value={c}
                  onChange={(v) => choix(langue, index, v)}
                  fullWidth
                />
              ))}
              <TextField
                label={t("quizBank.explanation")}
                value={q[langue].explication}
                onChange={(v) => texte(langue, "explication", v)}
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          ))}
        </Columns>
        <Switch
          label={t("quizBank.activeLabel")}
          helperText={t("quizBank.activeHint")}
          checked={q.active}
          onChange={(active) => setQ({ ...q, active })}
        />
        <Stack direction="row" spacing={1.5}>
          <Button loading={envoi} onClick={() => void enregistre()}>
            {t("quizBank.save")}
          </Button>
          <Button variant="ghost" onClick={onAnnule}>
            {t("quizBank.cancel")}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

export default QuizBankPage;
