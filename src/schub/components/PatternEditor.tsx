import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Chip,
  DataTable,
  Icon,
  Stack,
  StatGrid,
  Text,
  TextField,
  messageOf,
  useLocaleFormat,
  useRequest,
} from "../../common";
import {
  activatePatternApi,
  draftPatternApi,
  getPatternImpactApi,
  getPatternsApi,
  getPatternVersionsApi,
  rollbackPatternApi,
  type ImpactDto,
  type PatternDto,
  type PatternRequest,
} from "../api/augurApi";

const MODELE: Omit<PatternRequest, "comment"> = {
  key: "nouveau-pattern",
  scope: "GAME",
  polarity: "WEAKNESS",
  category: "BEHAVIOUR",
  nature: "ACTION",
  required: [
    { signal: "deathsPer10", unit: "PERCENTILE", from: 60, to: 85, weight: 1 },
  ],
  optional: [],
  exceptions: [],
  optionalInfluence: 0.3,
  threshold: 0.5,
  label: { fr: "", en: "" },
  sentence: { fr: "", en: "" },
  experimental: true,
  limits: { fr: "", en: "" },
};

const contenu = (p: PatternDto): Omit<PatternRequest, "comment"> => ({
  key: p.key,
  scope: p.scope,
  polarity: p.polarity,
  category: p.category,
  nature: p.nature,
  required: p.required,
  optional: p.optional,
  exceptions: p.exceptions,
  optionalInfluence: p.optionalInfluence,
  threshold: p.threshold,
  label: p.label,
  sentence: p.sentence,
  experimental: p.experimental,
  limits: p.limits,
});

/**
 * Les règles du moteur de constats. Une version active ne change jamais : on écrit un brouillon, on mesure
 * ce qu'il changerait, puis on l'active ; chaque geste porte un commentaire.
 */
export function PatternEditor() {
  const { t } = useTranslation("riot");
  const { formatDateTime } = useLocaleFormat();
  const {
    data: patterns,
    error,
    reload,
  } = useRequest("augur/patterns", getPatternsApi);
  const [cle, setCle] = useState<string | null>(null);
  const { data: versions, reload: reloadVersions } = useRequest(
    cle ? `augur/patterns/${cle}` : null,
    () => getPatternVersionsApi(cle!),
  );
  const [texte, setTexte] = useState<string>("");
  const [commentaire, setCommentaire] = useState<string>("");
  const [impact, setImpact] = useState<ImpactDto | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(
    null,
  );
  const [occupe, setOccupe] = useState<boolean>(false);

  const ouvrir = (p: PatternDto | null) => {
    setCle(p ? p.key : null);
    setTexte(JSON.stringify(p ? contenu(p) : MODELE, null, 2));
    setImpact(null);
    setMessage(null);
  };

  const derniere = versions?.[0] ?? null;
  const brouillon = derniere?.status === "DRAFT" ? derniere : null;
  const active = versions?.find((v) => v.status === "ACTIVE") ?? null;
  const retourPossible = Boolean(
    active &&
    versions?.some((v) => v.status === "RETIRED" && v.version < active.version),
  );

  const agir = async (geste: () => Promise<unknown>, succes: string) => {
    setOccupe(true);
    setMessage(null);
    try {
      await geste();
      setMessage({ ok: true, texte: succes });
      await Promise.all([reload(), reloadVersions()]);
    } catch (erreur) {
      setMessage({ ok: false, texte: messageOf(erreur, t("augur.failed")) });
    } finally {
      setOccupe(false);
    }
  };

  const enregistrer = () => {
    let requete: PatternRequest;
    try {
      requete = {
        ...(JSON.parse(texte) as Omit<PatternRequest, "comment">),
        comment: commentaire,
      };
    } catch {
      setMessage({ ok: false, texte: t("augur.invalidJson") });
      return;
    }
    void agir(async () => {
      const cree = await draftPatternApi(requete);
      setCle(cree.key);
    }, t("augur.drafted"));
  };

  return (
    <Card title={t("augur.title")} description={t("augur.description")}>
      <Stack spacing={2}>
        {error !== null && !patterns && (
          <Alert severity="error">{messageOf(error, t("augur.failed"))}</Alert>
        )}
        <DataTable<PatternDto>
          dense
          caption={t("augur.title")}
          emptyTitle={t("augur.empty")}
          rows={patterns ?? []}
          rowKey={(p) => p.key}
          rowAccent={(p) => p.key === cle}
          columns={[
            {
              key: "label",
              header: t("augur.label"),
              render: (p) => (
                <Stack direction="row" spacing={1} align="center">
                  <Text>{p.label.fr ?? p.key}</Text>
                  {p.experimental && (
                    <Chip
                      size="small"
                      variant="outline"
                      icon={<Icon name="science" size="small" />}
                      label={t("augur.experimental")}
                    />
                  )}
                </Stack>
              ),
            },
            {
              key: "key",
              header: t("augur.key"),
              render: (p) => <Text mono>{p.key}</Text>,
            },
            {
              key: "scope",
              header: t("augur.scope"),
              render: (p) => t(`augur.scopes.${p.scope}`),
            },
            {
              key: "status",
              header: t("augur.version"),
              align: "right",
              render: (p) => (
                <Chip
                  size="small"
                  tone={p.status === "ACTIVE" ? "success" : "warning"}
                  label={`v${p.version} · ${t(`augur.status.${p.status}`)}`}
                />
              ),
            },
            {
              key: "open",
              header: "",
              align: "right",
              render: (p) => (
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => ouvrir(p)}
                >
                  {t("augur.open")}
                </Button>
              ),
            },
          ]}
        />
        <Stack direction="row">
          <Button variant="ghost" onClick={() => ouvrir(null)}>
            {t("augur.new")}
          </Button>
        </Stack>

        {texte && (
          <Stack spacing={2}>
            {versions && versions.length > 0 && (
              <Stack spacing={0.5}>
                <Text variant="subtitle">{t("augur.history")}</Text>
                {versions.map((v) => (
                  <Text key={v.version} variant="caption" tone="secondary">
                    {`v${v.version} · ${t(`augur.status.${v.status}`)} · ${v.createdAt ? formatDateTime(new Date(v.createdAt)) : "—"} · ${v.comment ?? ""}`}
                  </Text>
                ))}
              </Stack>
            )}
            <TextField
              label={t("augur.content")}
              value={texte}
              onChange={setTexte}
              multiline
              minRows={14}
              fullWidth
              helperText={t("augur.contentHelp")}
            />
            <TextField
              label={t("augur.comment")}
              value={commentaire}
              onChange={setCommentaire}
              fullWidth
              helperText={t("augur.commentHelp")}
            />
            {message && (
              <Alert severity={message.ok ? "success" : "error"}>
                {message.texte}
              </Alert>
            )}
            <Stack direction="responsive" spacing={1.5}>
              <Button
                onClick={enregistrer}
                loading={occupe}
                disabled={!commentaire.trim()}
              >
                {t("augur.saveDraft")}
              </Button>
              {brouillon && (
                <Button
                  variant="secondary"
                  loading={occupe}
                  onClick={() =>
                    void agir(
                      async () =>
                        setImpact(
                          await getPatternImpactApi(
                            brouillon.key,
                            brouillon.version,
                          ),
                        ),
                      t("augur.measured"),
                    )
                  }
                >
                  {t("augur.impact")}
                </Button>
              )}
              {brouillon && (
                <Button
                  variant="secondary"
                  loading={occupe}
                  disabled={!commentaire.trim()}
                  onClick={() =>
                    void agir(
                      () =>
                        activatePatternApi(
                          brouillon.key,
                          brouillon.version,
                          commentaire,
                        ),
                      t("augur.activated"),
                    )
                  }
                >
                  {t("augur.activate")}
                </Button>
              )}
              {retourPossible && active && (
                <Button
                  variant="danger"
                  loading={occupe}
                  disabled={!commentaire.trim()}
                  onClick={() =>
                    void agir(
                      () => rollbackPatternApi(active.key, commentaire),
                      t("augur.rolledBack"),
                    )
                  }
                >
                  {t("augur.rollback")}
                </Button>
              )}
            </Stack>
            {impact && (
              <StatGrid
                divided
                items={[
                  {
                    key: "sampled",
                    label: t("augur.sampled"),
                    value: String(impact.sampled),
                  },
                  {
                    key: "appearing",
                    label: t("augur.appearing"),
                    value: String(impact.appearing),
                  },
                  {
                    key: "disappearing",
                    label: t("augur.disappearing"),
                    value: String(impact.disappearing),
                  },
                  {
                    key: "unchanged",
                    label: t("augur.unchanged"),
                    value: String(impact.unchanged),
                  },
                  ...Object.entries(impact.byTier).map(
                    ([palier, [plus, moins]]) => ({
                      key: palier,
                      label: palier,
                      value: `+${plus} / −${moins}`,
                    }),
                  ),
                ]}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
