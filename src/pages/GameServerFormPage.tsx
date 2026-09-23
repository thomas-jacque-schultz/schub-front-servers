import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  PageHeader,
  ProgressBar,
  SelectField,
  Stack,
  TextField,
} from "../design-system";
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
import type {
  GameServerFormMode,
  GameServerPortDto,
  UpsertGameServerPayload,
} from "../types/server";
import { hasInfrastructureView } from "../types/server";

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
  ports: "",
};

// Convention de nommage des déploiements de jeu : gaming-*. Le connecteur liste tout, le tri se fait ici.
const GAME_DEPLOYMENT_MARKER = "gaming";

const REQUIRED_FIELDS: Array<keyof GameServerFormValues> = ["slug", "name"];

const PORT_ENTRY_PATTERN = /^(tcp|udp):(\d{1,5})(?::(\d{1,5}))?$/i;

const isValidPort = (port: number) => Number.isInteger(port) && port >= 1 && port <= 65535;

// proto:portWan[:portLan], portLan = portWan par défaut. Port publié sur le nœud Swarm, pas le port du conteneur.
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

// ports omis sans SERVER_INFRA_VIEW : un tableau vide effacerait des redirections que l'acteur ne voit pas.
const toPayload = (
  values: GameServerFormValues,
  seesInfrastructure: boolean,
): UpsertGameServerPayload => ({
  slug: values.slug.trim(),
  deploymentId: values.deploymentId.trim() ? Number(values.deploymentId.trim()) : undefined,
  name: values.name.trim(),
  urlConnection: values.urlConnection.trim() || undefined,
  game: values.game.trim() || undefined,
  playersMax: values.playersMax.trim() ? Number(values.playersMax.trim()) : undefined,
  installation: values.installation.trim() || undefined,
  version: values.version.trim() || undefined,
  description: values.description.trim() || undefined,
  ports: seesInfrastructure ? parsePorts(values.ports) || [] : undefined,
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
  const { can } = useAuthStore();
  const [values, setValues] = useState<GameServerFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deployments, setDeployments] = useState<DeploymentDto[]>([]);
  const [deploymentsError, setDeploymentsError] = useState<string>("");
  const [seesInfrastructure, setSeesInfrastructure] = useState<boolean>(
    can("SERVER_INFRA_VIEW"),
  );

  const mode = useMemo(() => resolveMode(window.location.pathname), []);
  const isReadOnly = mode === "visualisation";
  const pageTitle = t(`form.title.${mode}`);

  useEffect(() => {
    if (mode === "visualisation" || !can("SERVER_INFRA_VIEW")) {
      return;
    }

    let active = true;
    void (async () => {
      try {
        const payload = await getDeploymentsApi();
        if (active) {
          setDeployments(payload);
          setDeploymentsError("");
        }
      } catch (error) {
        if (active) {
          setDeploymentsError(
            error instanceof Error ? error.message : t("form.errors.deploymentsUnavailable"),
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [mode, can, t]);

  useEffect(() => {
    if (!id || mode === "creation") {
      return;
    }

    let active = true;

    const loadServer = async () => {
      setIsLoading(true);
      setGlobalError("");

      try {
        const server = await getGameServerByIdApi(id);
        if (!active) {
          return;
        }

        if (!server) {
          setGlobalError(t("form.errors.notFound"));
          return;
        }

        setSeesInfrastructure(hasInfrastructureView(server));
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
  }, [id, mode, t]);

  const onFieldChange = (field: keyof GameServerFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setGlobalError("");
  };

  const selectedDeployment = useMemo(
    () => deployments.find((deployment) => String(deployment.id) === values.deploymentId) ?? null,
    [deployments, values.deploymentId],
  );

  const deploymentOptions = useMemo(() => {
    const games = deployments.filter((deployment) =>
      deployment.name.toLowerCase().includes(GAME_DEPLOYMENT_MARKER),
    );
    if (selectedDeployment && !games.some((deployment) => deployment.id === selectedDeployment.id)) {
      return [selectedDeployment, ...games];
    }
    return games;
  }, [deployments, selectedDeployment]);

  const onDeploymentChange = (deploymentId: string) => {
    const deployment = deployments.find((candidate) => String(candidate.id) === deploymentId) ?? null;
    setValues((current) => ({
      ...current,
      deploymentId,
      slug: mode === "creation" && deployment ? slugFromDeploymentName(deployment.name) : current.slug,
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

    if (nextErrors.slug) {
      nextErrors.slug = t("form.errors.deploymentRequired");
    }

    if (values.playersMax.trim()) {
      const asNumber = Number(values.playersMax.trim());
      if (!Number.isFinite(asNumber) || asNumber < 0) {
        nextErrors.playersMax = t("form.errors.playersMax");
      }
    }

    if (seesInfrastructure && parsePorts(values.ports) === null) {
      nextErrors.ports = t("form.errors.portsFormat");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isReadOnly) {
      navigate("/config/servers");
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGlobalError("");

    const payload = toPayload(values, seesInfrastructure);

    try {
      if (mode === "creation") {
        await createGameServerApi(payload);
      } else if (mode === "edition" && id) {
        await updateGameServerApi(id, payload);
      }

      navigate("/config/servers", { replace: true });
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : t("form.errors.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldDisabled = isReadOnly || isLoading;
  const infraDisabled = fieldDisabled || !seesInfrastructure;

  return (
    <Stack spacing={3} component="form" onSubmit={onSubmit}>
      <PageHeader
        eyebrow={t("config.eyebrow")}
        title={pageTitle}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate("/config/servers")}>
              {t("actions.back", { ns: "common" })}
            </Button>
            {!isReadOnly && (
              <Button type="submit" loading={isSubmitting}>
                {mode === "creation"
                  ? t("actions.create", { ns: "common" })
                  : t("actions.save", { ns: "common" })}
              </Button>
            )}
          </>
        }
      />

      {isLoading && <ProgressBar label={pageTitle} />}
      {globalError && <Alert severity="error">{globalError}</Alert>}

      {!seesInfrastructure && <Alert severity="info">{t("form.infraHidden")}</Alert>}

      {deploymentsError && (
        <Alert severity="warning">
          {t("form.errors.deploymentsCatalog", { reason: deploymentsError })}
        </Alert>
      )}

      <Card>
        <Stack spacing={3}>
          <Stack direction="responsive" spacing={2}>
            <SelectField
              label={t("form.fields.deployment")}
              value={values.deploymentId}
              onChange={onDeploymentChange}
              options={deploymentOptions.map((deployment) => ({
                value: String(deployment.id),
                label: `${deployment.name} (#${deployment.id})`,
              }))}
              disabled={infraDisabled || deploymentOptions.length === 0}
              error={Boolean(errors.deploymentId || errors.slug)}
              helperText={
                errors.deploymentId ||
                errors.slug ||
                (values.slug
                  ? t("form.helpers.deploymentLinked", { slug: values.slug })
                  : t("form.helpers.deploymentEmpty"))
              }
            />
            <TextField
              label={t("form.fields.name")}
              value={values.name}
              onChange={(value) => onFieldChange("name", value)}
              disabled={fieldDisabled}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          </Stack>

          <Stack direction="responsive" spacing={2}>
            <TextField
              label={t("form.fields.game")}
              value={values.game}
              onChange={(value) => onFieldChange("game", value)}
              disabled={fieldDisabled}
            />
            <TextField
              label={t("form.fields.playersMax")}
              value={values.playersMax}
              onChange={(value) => onFieldChange("playersMax", value)}
              disabled={fieldDisabled}
              error={Boolean(errors.playersMax)}
              helperText={errors.playersMax}
            />
          </Stack>

          <TextField
            label={t("form.fields.urlConnection")}
            value={values.urlConnection}
            onChange={(value) => onFieldChange("urlConnection", value)}
            disabled={fieldDisabled}
          />

          <Stack direction="responsive" spacing={2}>
            <TextField
              label={t("form.fields.installation")}
              value={values.installation}
              onChange={(value) => onFieldChange("installation", value)}
              disabled={fieldDisabled}
            />
            <TextField
              label={t("form.fields.version")}
              value={values.version}
              onChange={(value) => onFieldChange("version", value)}
              disabled={fieldDisabled}
            />
          </Stack>

          <TextField
            label={t("form.fields.ports")}
            value={values.ports}
            onChange={(value) => onFieldChange("ports", value)}
            disabled={infraDisabled}
            error={Boolean(errors.ports)}
            helperText={errors.ports || t("form.helpers.ports")}
          />

          <TextField
            label={t("form.fields.description")}
            value={values.description}
            onChange={(value) => onFieldChange("description", value)}
            disabled={fieldDisabled}
            multiline
            minRows={4}
          />
        </Stack>
      </Card>
    </Stack>
  );
}

export default GameServerFormPage;
