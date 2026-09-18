import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  MultiSelect,
  type MultiSelectOption,
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
import { getUsersApi } from "../api/usersApi";
import { useAuthStore } from "../stores/authStore";
import type { DeploymentDto } from "../types/deployment";
import { slugFromDeploymentName } from "../types/deployment";
import { userLabelOf, type UserDto } from "../types/user";
import type {
  GameServerFormMode,
  GameServerPortDto,
  ServerAdminDto,
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

/**
 * Le corps de la requête.
 *
 * <p>`admins` et `ports` sont **omis** quand l'acteur ne voit pas l'infrastructure : le cœur
 * laisse alors les listes existantes intactes. Les envoyer vides — ce qu'un formulaire qui ne
 * les a jamais reçues ferait naturellement — effacerait à la première sauvegarde des
 * administrateurs et des redirections que l'acteur n'avait même pas le droit de lire.</p>
 */
const toPayload = (
  values: GameServerFormValues,
  adminIds: string[],
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
  // Le cœur ne lit que `userId` en entrée ; le reste de la forme n'est renseigné qu'en sortie.
  admins: seesInfrastructure ? adminIds.map((userId) => ({ userId })) : undefined,
  // champ vidé = toutes les redirections du serveur sont retirées
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

/**
 * La fiche d'un serveur.
 *
 * <p>Deux nouveautés du lot A.5 s'y voient : le champ `admins` est devenu un sélecteur de
 * comptes, avec portrait et pseudo ; et la fiche sait être servie **amputée**. Un acteur sans
 * `SERVER_INFRA_VIEW` reçoit la projection membre — ni ports, ni déploiement, ni
 * administrateurs. Ce n'est pas une erreur de chargement, et la fiche le dit au lieu d'afficher
 * des champs vides qui laisseraient croire à des données perdues.</p>
 */
function GameServerFormPage() {
  const navigate = useLocalizedNavigate();
  const { t } = useTranslation("servers");
  const { id } = useParams();
  const { accessToken, can } = useAuthStore();
  const [values, setValues] = useState<GameServerFormValues>(DEFAULT_VALUES);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [knownAdmins, setKnownAdmins] = useState<ServerAdminDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [usersError, setUsersError] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deployments, setDeployments] = useState<DeploymentDto[]>([]);
  const [deploymentsError, setDeploymentsError] = useState<string>("");
  /** Ce que **cette fiche** a livré : une création part du principe qu'on voit tout. */
  const [seesInfrastructure, setSeesInfrastructure] = useState<boolean>(
    can("SERVER_INFRA_VIEW"),
  );

  const mode = useMemo(() => resolveMode(window.location.pathname), []);
  const isReadOnly = mode === "visualisation";
  const pageTitle = t(`form.title.${mode}`);

  // Le catalogue des déploiements sert à lier la fiche au sien sans le saisir. En consultation,
  // le champ est figé : inutile d'interroger le cœur pour une liste qu'on ne peut pas ouvrir.
  useEffect(() => {
    if (!accessToken || mode === "visualisation" || !can("SERVER_INFRA_VIEW")) {
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
  }, [accessToken, mode, can, t]);

  /**
   * Le catalogue des comptes, pour le sélecteur d'administrateurs.
   *
   * <p>Il demande `USER_VIEW`, que `SERVER_EDIT` n'implique pas. Sans lui, le champ reste
   * lisible — les administrateurs déjà en place viennent de la fiche elle-même — mais figé :
   * proposer une liste vide ferait croire qu'il n'existe aucun compte.</p>
   */
  useEffect(() => {
    if (!accessToken || !can("USER_VIEW")) {
      return;
    }

    let active = true;
    void (async () => {
      try {
        const payload = await getUsersApi(accessToken);
        if (active) {
          setUsers(payload);
          setUsersError("");
        }
      } catch (error) {
        if (active) {
          setUsersError(
            error instanceof Error ? error.message : t("form.errors.usersUnavailable"),
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [accessToken, can, t]);

  useEffect(() => {
    if (!id || mode === "creation" || !accessToken) {
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
        setKnownAdmins(server.admins ?? []);
        setAdminIds((server.admins ?? []).map((admin) => admin.userId));
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

  // La fiche stocke l'identifiant du déploiement, pas le déploiement : on le retrouve dans le
  // catalogue. Null tant qu'il n'est pas chargé, ou si le déploiement lié a disparu du cœur —
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

  /**
   * Les comptes proposés comme administrateurs.
   *
   * <p>Les administrateurs déjà posés sur la fiche sont fusionnés au catalogue : sans eux, un
   * compte retiré de la liste des comptes visibles disparaîtrait du sélecteur et se ferait
   * effacer à la sauvegarde suivante.</p>
   */
  const adminOptions = useMemo<MultiSelectOption[]>(() => {
    const fromUsers = users.map((user) => ({
      value: user.id,
      label: userLabelOf(user),
      avatarUrl: user.avatarUrl,
      description: user.roleName,
    }));
    const missing = knownAdmins
      .filter((admin) => !users.some((user) => user.id === admin.userId))
      .map((admin) => ({
        value: admin.userId,
        label: admin.discordUsername || admin.userId,
        avatarUrl: admin.avatarUrl,
      }));
    return [...fromUsers, ...missing];
  }, [users, knownAdmins]);

  const onDeploymentChange = (deploymentId: string) => {
    const deployment = deployments.find((candidate) => String(candidate.id) === deploymentId) ?? null;
    setValues((current) => ({
      ...current,
      deploymentId,
      // L'identifiant n'est dérivé qu'à la création. En édition il reste tel quel : c'est la clé
      // d'unicité de la fiche, le propriétaire de ses règles de ports et l'argument des commandes
      // Discord. Le recalculer orphelinerait les redirections et casserait les commandes connues.
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

    if (!accessToken) {
      setGlobalError(t("errors.invalidSession", { ns: "auth" }));
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setGlobalError("");

    const payload = toPayload(values, adminIds, seesInfrastructure);

    try {
      if (mode === "creation") {
        await createGameServerApi(accessToken, payload);
      } else if (mode === "edition" && id) {
        await updateGameServerApi(accessToken, id, payload);
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

      {/* Une absence attendue, pas une panne : on le dit, plutôt que d'afficher des trous. */}
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

          <MultiSelect
            label={t("form.fields.admins")}
            values={adminIds}
            onChange={setAdminIds}
            options={adminOptions}
            disabled={infraDisabled || (!can("USER_VIEW") && adminOptions.length === 0)}
            error={Boolean(usersError)}
            helperText={
              usersError ||
              (can("USER_VIEW")
                ? t("form.helpers.admins")
                : t("form.helpers.adminsUnavailable"))
            }
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
