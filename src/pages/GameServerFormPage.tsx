import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormActionButton from "../components/FormActionButton";
import { Button, PageBackdrop } from "../design-system";
import { useLocalizedNavigate } from "../i18n/navigation";
import {
  createGameServerApi,
  getGameServerByIdApi,
  updateGameServerApi,
} from "../api/serversApi";
import { getDeploymentsApi } from "../api/deploymentsApi";
import { useAuthStore } from "../stores/authStore";
import type { DeploymentDto } from "../types/deployment";
import { slugFromDeploymentName } from "../types/deployment";
import type { GameServerFormMode, GameServerPortDto, UpsertGameServerPayload } from "../types/server";

interface GameServerFormValues {
  slug: string;
  deploymentId: string;
  name: string;
  urlConnection: string;
  game: string;
  playersMax: string;
  installation: string;
  version: string;
  description: string;
  admins: string;
  ports: string;
}

const DEFAULT_VALUES: GameServerFormValues = {
  slug: "",
  deploymentId: "",
  name: "",
  urlConnection: "",
  game: "",
  playersMax: "",
  installation: "",
  version: "",
  description: "",
  admins: "",
  ports: "",
};

/**
 * Les déploiements de jeu suivent tous la convention de nommage `gaming-*`.
 * Le filtre est volontairement côté client : le connecteur, lui, liste tout sans savoir
 * lesquelles sont des serveurs de jeu — c est au consommateur de trier (plan §6).
 */
const GAME_DEPLOYMENT_MARKER = "gaming";

const REQUIRED_FIELDS: Array<keyof GameServerFormValues> = ["slug", "name"];

const PORT_ENTRY_PATTERN = /^(tcp|udp):(\d{1,5})(?::(\d{1,5}))?$/i;

const isValidPort = (port: number) => Number.isInteger(port) && port >= 1 && port <= 65535;

/**
 * Parse "tcp:15007, udp:8211" en redirections Freebox.
 * Chaque entrée est proto:portWan[:portLan] ; portLan vaut portWan par défaut.
 * Le port indiqué est celui publié sur le nœud Swarm, pas le port interne au conteneur.
 * Renvoie null dès qu'une entrée est mal formée, pour que le formulaire puisse le signaler.
 */
const parsePorts = (raw: string): GameServerPortDto[] | null => {
  const parsed: GameServerPortDto[] = [];

  for (const entry of raw.split(",").map((item) => item.trim()).filter(Boolean)) {
    const match = PORT_ENTRY_PATTERN.exec(entry);
    if (!match) {
      return null;
    }
    const wanPort = Number(match[2]);
    const lanPort = match[3] ? Number(match[3]) : wanPort;
    if (!isValidPort(wanPort) || !isValidPort(lanPort)) {
      return null;
    }
    parsed.push({ proto: match[1].toLowerCase(), wanPort, lanPort });
  }

  return parsed;
};

const formatPorts = (ports?: GameServerPortDto[]): string =>
  (ports || [])
    .map((port) =>
      port.lanPort && port.lanPort !== port.wanPort
        ? `${port.proto}:${port.wanPort}:${port.lanPort}`
        : `${port.proto}:${port.wanPort}`,
    )
    .join(", ");

const toPayload = (values: GameServerFormValues): UpsertGameServerPayload => ({
  slug: values.slug.trim(),
  deploymentId: values.deploymentId.trim() ? Number(values.deploymentId.trim()) : undefined,
  name: values.name.trim(),
  urlConnection: values.urlConnection.trim() || undefined,
  game: values.game.trim() || undefined,
  playersMax: values.playersMax.trim() ? Number(values.playersMax.trim()) : undefined,
  installation: values.installation.trim() || undefined,
  version: values.version.trim() || undefined,
  description: values.description.trim() || undefined,
  admins: values.admins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  // champ vidé = toutes les redirections du serveur sont retirées
  ports: parsePorts(values.ports) || [],
});

const resolveMode = (pathname: string): GameServerFormMode => {
  if (pathname.endsWith("/edit")) {
    return "edition";
  }
  if (pathname.endsWith("/view")) {
    return "visualisation";
  }
  return "creation";
};

function GameServerFormPage() {
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("servers");
  const { id } = useParams();
  const { accessToken } = useAuthStore();
  const [values, setValues] = useState<GameServerFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deployments, setDeployments] = useState<DeploymentDto[]>([]);
  const [deploymentsError, setDeploymentsError] = useState<string>("");

  const mode = useMemo(() => resolveMode(window.location.pathname), []);

  // Le catalogue des déploiements sert à lier la fiche au sien sans le saisir. En consultation,
  // le champ est figé : inutile d'interroger le cœur pour une liste qu'on ne peut pas ouvrir.
  useEffect(() => {
    if (!accessToken || mode === "visualisation") {
      return;
    }

    let active = true;
    void (async () => {
      try {
        const payload = await getDeploymentsApi(accessToken);
        if (active) {
          setDeployments(payload);
          setDeploymentsError("");
        }
      } catch (error) {
        if (active) {
          // Non bloquant : la fiche reste remplissable, seule la liste manque.
          setDeploymentsError(
            error instanceof Error ? error.message : t("form.errors.deploymentsUnavailable"),
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [accessToken, mode, t]);
  const isReadOnly = mode === "visualisation";
  const pageTitle = t(`form.title.${mode}`);

  useEffect(() => {
    if (!id || mode === "creation") {
      return;
    }

    if (!accessToken) {
      return;
    }

    let active = true;

    const loadServer = async () => {
      setIsLoading(true);
      setGlobalError("");

      try {
        const server = await getGameServerByIdApi(accessToken, id);
        if (!active) {
          return;
        }

        if (!server) {
          setGlobalError(t("form.errors.notFound"));
          return;
        }

        setValues({
          slug: server.slug || "",
          deploymentId: typeof server.deploymentId === "number" ? String(server.deploymentId) : "",
          name: server.name || "",
          urlConnection: server.urlConnection || "",
          game: server.game || "",
          playersMax:
            typeof server.playersMax === "number" ? String(server.playersMax) : "",
          installation: server.installation || "",
          version: server.version || "",
          description: server.description || "",
          admins: (server.admins || []).join(", "),
          ports: formatPorts(server.ports),
        });
      } catch (error) {
        if (!active) {
          return;
        }
        setGlobalError(error instanceof Error ? error.message : t("form.errors.loadFailed"));
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadServer();

    return () => {
      active = false;
    };
  }, [accessToken, id, mode, t]);

  const onFieldChange = (field: keyof GameServerFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setGlobalError("");
  };

  /**
   * Lier la fiche à un déploiement renseigne les deux champs d'un coup.
   *
   * L'identifiant n'est dérivé qu'à la création. En édition il reste tel quel : c'est la clé
   * d'unicité de la fiche, le propriétaire de ses règles de ports et l'argument des commandes
   * Discord. Le recalculer parce qu'on rebranche un déploiement orphelinerait les redirections
   * existantes et casserait les commandes déjà connues des utilisateurs.
   */
  // La fiche stocke l'identifiant du déploiement, pas le déploiement : on le retrouve dans le catalogue.
  // Null tant que le catalogue n'est pas chargé, ou si le déploiement lié a disparu du cœur —
  // auquel cas le champ apparaît vide, ce qui est la vérité à afficher.
  const selectedDeployment = useMemo(
    () => deployments.find((deployment) => String(deployment.id) === values.deploymentId) ?? null,
    [deployments, values.deploymentId],
  );

  // Le déploiement déjà lié reste proposé même s'il ne porte pas le marqueur : une fiche
  // existante ne doit pas voir son champ se vider parce que la convention a changé.
  const deploymentOptions = useMemo(() => {
    const games = deployments.filter((deployment) =>
      deployment.name.toLowerCase().includes(GAME_DEPLOYMENT_MARKER),
    );
    if (selectedDeployment && !games.some((deployment) => deployment.id === selectedDeployment.id)) {
      return [selectedDeployment, ...games];
    }
    return games;
  }, [deployments, selectedDeployment]);

  const onDeploymentChange = (deployment: DeploymentDto | null) => {
    setValues((current) => ({
      ...current,
      deploymentId: deployment ? String(deployment.id) : "",
      slug:
        mode === "creation" && deployment ? slugFromDeploymentName(deployment.name) : current.slug,
    }));
    setErrors((current) => ({ ...current, deploymentId: "", slug: "" }));
    setGlobalError("");
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!values[field].trim()) {
        nextErrors[field] = t("form.errors.required");
      }
    });

    // Le slug n'est plus saisi : il vient du déploiement choisi. Le message doit donc
    // désigner le geste manquant, pas un champ que l'utilisateur ne voit plus.
    if (nextErrors.slug) {
      nextErrors.slug = t("form.errors.deploymentRequired");
    }

    if (values.playersMax.trim()) {
      const asNumber = Number(values.playersMax.trim());
      if (!Number.isFinite(asNumber) || asNumber < 0) {
        nextErrors.playersMax = t("form.errors.playersMax");
      }
    }

    if (parsePorts(values.ports) === null) {
      nextErrors.ports = t("form.errors.portsFormat");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isReadOnly) {
      navigate("/dashboard");
      return;
    }

    if (!accessToken) {
      setGlobalError(t("errors.invalidSession", { ns: "auth" }));
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGlobalError("");

    const payload = toPayload(values);

    try {
      if (mode === "creation") {
        await createGameServerApi(accessToken, payload);
      } else if (mode === "edition" && id) {
        await updateGameServerApi(accessToken, id, payload);
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("form.errors.saveFailed");
      setGlobalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldDisabled = isReadOnly || isLoading;

  return (
    <PageBackdrop variant="panel">
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={onSubmit}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Button variant="ghost" startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard")}>
                  {t("actions.back", { ns: "common" })}
                </Button>
                <Typography variant="h4" fontWeight={700}>
                  {pageTitle}
                </Typography>
              </Stack>

              {globalError && <Alert severity="error">{globalError}</Alert>}

              {deploymentsError && (
                <Alert severity="warning">
                  {t("form.errors.deploymentsCatalog", { reason: deploymentsError })}
                </Alert>
              )}

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Autocomplete
                  options={deploymentOptions}
                  value={selectedDeployment}
                  onChange={(_event, deployment) => onDeploymentChange(deployment)}
                  getOptionLabel={(deployment) => `${deployment.name}  (#${deployment.id})`}
                  isOptionEqualToValue={(option, selected) => option.id === selected.id}
                  // En consultation, fieldDisabled vaut déjà vrai : tester le mode en plus serait
                  // une condition morte, que TypeScript signale.
                  disabled={fieldDisabled || deploymentOptions.length === 0}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("form.fields.deployment")}
                      error={Boolean(errors.deploymentId || errors.slug)}
                      helperText={
                        errors.deploymentId ||
                        errors.slug ||
                        (values.slug
                          ? t("form.helpers.deploymentLinked", { slug: values.slug })
                          : t("form.helpers.deploymentEmpty"))
                      }
                    />
                  )}
                />
                <TextField
                  label={t("form.fields.name")}
                  value={values.name}
                  onChange={(event) => onFieldChange("name", event.target.value)}
                  disabled={fieldDisabled}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label={t("form.fields.game")}
                  value={values.game}
                  onChange={(event) => onFieldChange("game", event.target.value)}
                  disabled={fieldDisabled}
                  fullWidth
                />
                <TextField
                  label={t("form.fields.playersMax")}
                  value={values.playersMax}
                  onChange={(event) => onFieldChange("playersMax", event.target.value)}
                  disabled={fieldDisabled}
                  error={Boolean(errors.playersMax)}
                  helperText={errors.playersMax}
                  fullWidth
                />
              </Stack>

              <TextField
                label={t("form.fields.urlConnection")}
                value={values.urlConnection}
                onChange={(event) => onFieldChange("urlConnection", event.target.value)}
                disabled={fieldDisabled}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label={t("form.fields.installation")}
                  value={values.installation}
                  onChange={(event) => onFieldChange("installation", event.target.value)}
                  disabled={fieldDisabled}
                  fullWidth
                />
                <TextField
                  label={t("form.fields.version")}
                  value={values.version}
                  onChange={(event) => onFieldChange("version", event.target.value)}
                  disabled={fieldDisabled}
                  fullWidth
                />
              </Stack>

              <TextField
                label={t("form.fields.ports")}
                value={values.ports}
                onChange={(event) => onFieldChange("ports", event.target.value)}
                disabled={fieldDisabled}
                error={Boolean(errors.ports)}
                helperText={
                  errors.ports ||
                  t("form.helpers.ports")
                }
                fullWidth
              />

              <TextField
                label={t("form.fields.admins")}
                value={values.admins}
                onChange={(event) => onFieldChange("admins", event.target.value)}
                disabled={fieldDisabled}
                fullWidth
              />

              <TextField
                label={t("form.fields.description")}
                value={values.description}
                onChange={(event) => onFieldChange("description", event.target.value)}
                disabled={fieldDisabled}
                multiline
                minRows={4}
                fullWidth
              />

              <FormActionButton
                mode={mode}
                isSubmitting={isSubmitting}
                onBack={() => navigate("/dashboard")}
              />
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </PageBackdrop>
  );
}

export default GameServerFormPage;
