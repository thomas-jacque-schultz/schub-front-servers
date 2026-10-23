import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  ChampionIcon,
  Chip,
  Columns,
  DataTable,
  Dialog,
  Illustration,
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
  deleteQuizQuestionApi,
  getAllQuizQuestionsApi,
  type QuizQuestionDto,
  type QuizQuestionRequest,
  saveQuizQuestionApi,
} from "../../api/quizApi";

type Theme = QuizQuestionRequest["theme"];
type Langue = "fr" | "en";

const THEMES: Theme[] = ["OBJETS", "HISTOIRE", "SKINS", "MONDE", "PROS"];
const VIDE: QuizQuestionRequest = {
  theme: "PROS",
  date: "",
  source: "https://",
  image: null,
  imagesChoix: null,
  active: true,
  fr: { enonce: "", choix: ["", "", "", ""], explication: "" },
  en: { enonce: "", choix: ["", "", "", ""], explication: "" },
};

const requeteDe = (q: QuizQuestionDto): QuizQuestionRequest => ({
  theme: q.theme,
  date: q.date,
  source: q.source,
  image: q.image,
  imagesChoix: q.imagesChoix,
  active: q.active,
  fr: q.fr,
  en: q.en,
});

const cherchable = (texte: string) =>
  texte.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const contient = (q: QuizQuestionDto, recherche: string) =>
  [q.id, q.fr.enonce, q.en.enonce, ...q.fr.choix, ...q.en.choix].some((t) =>
    cherchable(t).includes(cherchable(recherche.trim())),
  );

/** Un splash se montre en grand, une icône en petit. */
function Image({ src, nom }: { src: string; nom: string }) {
  return src.includes("/splash/") ? (
    <Illustration src={src} alt={nom} maxHeight={200} />
  ) : (
    <ChampionIcon src={src} name={nom} size="large" />
  );
}

/**
 * Toutes les questions du quiz (Schub#137, #143) : écrites à la main ou fabriquées depuis Data Dragon et Univers.
 * L'OWNER les relit, les corrige, les supprime ou en importe un lot, sans redéploiement.
 */
function QuizBankPage() {
  const { t } = useTranslation("riot");
  const {
    data: questions,
    error,
    reload,
  } = useRequest("quiz/questions/all", getAllQuizQuestionsApi);
  const [filtre, setFiltre] = useState<"ALL" | Theme>("ALL");
  const [recherche, setRecherche] = useState("");
  const [importe, setImporte] = useState(false);
  const [edition, setEdition] = useState<{
    id: string;
    neuve: boolean;
    question: QuizQuestionRequest;
  } | null>(null);
  const [toast, setToast] = useState("");

  const visibles = (questions ?? []).filter(
    (q) =>
      (filtre === "ALL" || q.theme === filtre) &&
      (!recherche.trim() || contient(q, recherche)),
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
          onEnregistree={(message) => {
            setEdition(null);
            setToast(message);
            reload();
          }}
        />
      ) : (
        <Card
          title={t("quizBank.listTitle", { n: visibles.length })}
          actions={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setImporte(true)}
              >
                {t("quizBank.import")}
              </Button>
              <Button
                size="small"
                onClick={() =>
                  setEdition({ id: "", neuve: true, question: VIDE })
                }
              >
                {t("quizBank.add")}
              </Button>
            </Stack>
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
            <TextField
              label={t("quizBank.search")}
              value={recherche}
              onChange={setRecherche}
              fullWidth
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
                    <Stack direction="row" spacing={1} align="center">
                      {q.image && (
                        <ChampionIcon
                          src={q.image}
                          name={q.fr.enonce}
                          size="small"
                        />
                      )}
                      <Stack spacing={0.25}>
                        <Text>{q.fr.enonce}</Text>
                        <Text variant="caption" tone="secondary">
                          {q.fr.choix[0]} · {q.date}
                        </Text>
                      </Stack>
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
      <Importeur
        open={importe}
        onClose={() => setImporte(false)}
        onImporte={(message) => {
          setImporte(false);
          setToast(message);
          reload();
        }}
      />
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
  onEnregistree: (message: string) => void;
}) {
  const { t } = useTranslation("riot");
  const [id, setId] = useState(initiale.id);
  const [q, setQ] = useState(initiale.question);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [supprime, setSupprime] = useState(false);

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
      await saveQuizQuestionApi(id.trim(), {
        ...q,
        image: q.image?.trim() || null,
      });
      onEnregistree(t("quizBank.saved"));
    } catch (exception) {
      setErreur(messageOf(exception, t("quizBank.saveError")));
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async () => {
    setEnvoi(true);
    setErreur("");
    try {
      await deleteQuizQuestionApi(id);
      onEnregistree(t("quizBank.deleted"));
    } catch (exception) {
      setSupprime(false);
      setErreur(messageOf(exception, t("quizBank.deleteError")));
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
        <TextField
          label={t("quizBank.image")}
          value={q.image ?? ""}
          onChange={(v) => setQ({ ...q, image: v })}
          helperText={t("quizBank.imageHint")}
          type="url"
          fullWidth
        />
        {q.image?.startsWith("https://") && (
          <Image src={q.image} nom={q.fr.enonce} />
        )}
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
                <Stack key={index} spacing={0.5}>
                  <TextField
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
                  {q.imagesChoix?.[index] && (
                    <Stack direction="row" spacing={0.5} align="center">
                      <Text variant="caption" tone="secondary">
                        {t("quizBank.choiceIcons")}
                      </Text>
                      {q.imagesChoix[index].map((src, i) => (
                        <ChampionIcon key={i} src={src} name={c} size="small" />
                      ))}
                    </Stack>
                  )}
                </Stack>
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
          {!initiale.neuve && (
            <Button variant="danger" onClick={() => setSupprime(true)}>
              {t("quizBank.delete")}
            </Button>
          )}
        </Stack>
      </Stack>
      <Dialog
        open={supprime}
        title={t("quizBank.deleteTitle", { id })}
        description={t("quizBank.deleteHint")}
        confirmLabel={t("quizBank.delete")}
        cancelLabel={t("quizBank.cancel")}
        onConfirm={() => void supprimer()}
        onClose={() => setSupprime(false)}
        confirmLoading={envoi}
        destructive
      />
    </Card>
  );
}

/** Une entrée d'un lot : le format de fabriquees.json, le thème en minuscules. */
const versRequete = (entree: unknown): [string, QuizQuestionRequest] | null => {
  const e = entree as Partial<
    Omit<QuizQuestionRequest, "theme"> & { id: string; theme: string }
  > | null;
  const theme = e?.theme?.toUpperCase() as Theme | undefined;
  if (
    typeof e?.id !== "string" ||
    !theme ||
    !THEMES.includes(theme) ||
    !e.fr ||
    !e.en ||
    typeof e.date !== "string" ||
    typeof e.source !== "string"
  ) {
    return null;
  }
  return [
    e.id,
    {
      theme,
      date: e.date,
      source: e.source,
      image: e.image ?? null,
      imagesChoix: e.imagesChoix ?? null,
      fr: e.fr,
      en: e.en,
      active: e.active ?? true,
    },
  ];
};

function Importeur({
  open,
  onClose,
  onImporte,
}: {
  open: boolean;
  onClose: () => void;
  onImporte: (message: string) => void;
}) {
  const { t } = useTranslation("riot");
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const importer = async () => {
    setErreur("");
    let lot: [string, QuizQuestionRequest][];
    try {
      const lu: unknown = JSON.parse(contenu);
      const requetes = Array.isArray(lu) ? lu.map(versRequete) : [null];
      if (requetes.length === 0 || requetes.some((r) => r === null)) {
        throw new Error();
      }
      lot = requetes as [string, QuizQuestionRequest][];
    } catch {
      setErreur(t("quizBank.importInvalid"));
      return;
    }
    setEnvoi(true);
    const refusees: string[] = [];
    for (const [id, requete] of lot) {
      await saveQuizQuestionApi(id, requete).catch(() => refusees.push(id));
    }
    setEnvoi(false);
    if (refusees.length > 0) {
      setErreur(
        t("quizBank.importFailed", {
          n: refusees.length,
          ids: refusees.join(", "),
        }),
      );
      return;
    }
    setContenu("");
    onImporte(t("quizBank.importDone", { n: lot.length }));
  };

  return (
    <Dialog
      open={open}
      title={t("quizBank.importTitle")}
      description={t("quizBank.importHint")}
      confirmLabel={t("quizBank.importRun")}
      cancelLabel={t("quizBank.cancel")}
      onConfirm={() => void importer()}
      onClose={onClose}
      confirmDisabled={!contenu.trim()}
      confirmLoading={envoi}
      maxWidth="md"
    >
      <Stack spacing={1.5}>
        {erreur && <Alert severity="error">{erreur}</Alert>}
        <TextField
          label={t("quizBank.importField")}
          value={contenu}
          onChange={setContenu}
          multiline
          minRows={8}
          fullWidth
        />
      </Stack>
    </Dialog>
  );
}

export default QuizBankPage;
