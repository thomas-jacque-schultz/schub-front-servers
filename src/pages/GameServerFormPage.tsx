import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import FormActionButton from "../components/FormActionButton";
import {
  createGamingServerApi,
  getGamingServerByIdApi,
  updateGamingServerApi,
} from "../api/serversApi";
import { getPortainerStacksApi } from "../api/portainerApi";
import { useAuthStore } from "../stores/authStore";
import type { PortainerStackDto } from "../types/portainer";
import { identifierFromStackName } from "../types/portainer";
import type { GameServerFormMode, GamingServerPortDto, UpsertGamingServerPayload } from "../types/server";

interface GameServerFormValues {
  identifier: string;
  portainerStackId: string;
  name: string;
  urlConnection: string;
  gameName: string;
  playersMax: string;
  installation: string;
  version: string;
  description: string;
  admins: string;
  ports: string;
}

const DEFAULT_VALUES: GameServerFormValues = {
  identifier: "",
  portainerStackId: "",
  name: "",
  urlConnection: "",
  gameName: "",
  playersMax: "",
  installation: "",
  version: "",
  description: "",
  admins: "",
  ports: "",
};

/**
 * Les stacks de jeu suivent toutes la convention de nommage `gaming-*` dans Portainer.
 * Le filtre est volontairement côté client : le connecteur, lui, liste tout sans savoir
 * lesquelles sont des serveurs de jeu — c est au consommateur de trier (plan §6).
 */
const GAME_STACK_MARKER = "gaming";

const REQUIRED_FIELDS: Array<keyof GameServerFormValues> = ["identifier", "name"];

const PORT_ENTRY_PATTERN = /^(tcp|udp):(\d{1,5})(?::(\d{1,5}))?$/i;

const isValidPort = (port: number) => Number.isInteger(port) && port >= 1 && port <= 65535;

/**
 * Parse "tcp:15007, udp:8211" en redirections Freebox.
 * Chaque entrée est proto:portWan[:portLan] ; portLan vaut portWan par défaut.
 * Le port indiqué est celui publié sur le nœud Swarm, pas le port interne au conteneur.
 * Renvoie null dès qu'une entrée est mal formée, pour que le formulaire puisse le signaler.
 */
const parsePorts = (raw: string): GamingServerPortDto[] | null => {
  const parsed: GamingServerPortDto[] = [];

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

const formatPorts = (ports?: GamingServerPortDto[]): string =>
  (ports || [])
    .map((port) =>
      port.lanPort && port.lanPort !== port.wanPort
        ? `${port.proto}:${port.wanPort}:${port.lanPort}`
        : `${port.proto}:${port.wanPort}`,
    )
    .join(", ");

const toPayload = (values: GameServerFormValues): UpsertGamingServerPayload => ({
  identifier: values.identifier.trim(),
  portainerStackId: values.portainerStackId.trim() ? Number(values.portainerStackId.trim()) : undefined,
  name: values.name.trim(),
  urlConnection: values.urlConnection.trim() || undefined,
  gameName: values.gameName.trim() || undefined,
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
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuthStore();
  const [values, setValues] = useState<GameServerFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stacks, setStacks] = useState<PortainerStackDto[]>([]);
  const [stacksError, setStacksError] = useState<string>("");

  const mode = useMemo(() => resolveMode(window.location.pathname), []);

  // Le catalogue Portainer sert à lier la fiche à sa stack sans la saisir. En consultation,
  // le champ est figé : inutile d'interroger Portainer pour une liste qu'on ne peut pas ouvrir.
  useEffect(() => {
    if (!accessToken || mode === "visualisation") {
      return;
    }

    let active = true;
    void (async () => {
      try {
        const payload = await getPortainerStacksApi(accessToken);
        if (active) {
          setStacks(payload);
          setStacksError("");
        }
      } catch (error) {
        if (active) {
          // Non bloquant : la fiche reste remplissable, seule la liste manque.
          setStacksError(
            error instanceof Error ? error.message : "Impossible de lire les stacks Portainer",
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [accessToken, mode]);
  const isReadOnly = mode === "visualisation";
  const pageTitle =
    mode === "creation"
      ? "Creer une fiche serveur"
      : mode === "edition"
        ? "Editer une fiche serveur"
        : "Afficher une fiche serveur";

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
        const server = await getGamingServerByIdApi(accessToken, id);
        if (!active) {
          return;
        }

        if (!server) {
          setGlobalError("Serveur introuvable.");
          return;
        }

        setValues({
          identifier: server.identifier || "",
          portainerStackId: typeof server.portainerStackId === "number" ? String(server.portainerStackId) : "",
          name: server.name || "",
          urlConnection: server.urlConnection || "",
          gameName: server.gameName || "",
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
        setGlobalError(error instanceof Error ? error.message : "Erreur de chargement.");
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
  }, [accessToken, id, mode]);

  const onFieldChange = (field: keyof GameServerFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setGlobalError("");
  };

  /**
   * Lier la fiche à une stack renseigne les deux champs d'un coup.
   *
   * L'identifiant n'est dérivé qu'à la création. En édition il reste tel quel : c'est la clé
   * d'unicité de la fiche, le propriétaire de ses règles de ports et l'argument des commandes
   * Discord. Le recalculer parce qu'on rebranche une stack orphelinerait les redirections
   * existantes et casserait les commandes déjà connues des utilisateurs.
   */
  // La fiche stocke l'identifiant de la stack, pas la stack : on la retrouve dans le catalogue.
  // Null tant que le catalogue n'est pas chargé, ou si la stack liée a disparu de Portainer —
  // auquel cas le champ apparaît vide, ce qui est la vérité à afficher.
  const selectedStack = useMemo(
    () => stacks.find((stack) => String(stack.id) === values.portainerStackId) ?? null,
    [stacks, values.portainerStackId],
  );

  // La stack déjà liée reste proposée même si elle ne porte pas le marqueur : une fiche
  // existante ne doit pas voir son champ se vider parce que la convention a changé.
  const stackOptions = useMemo(() => {
    const games = stacks.filter((stack) =>
      stack.name.toLowerCase().includes(GAME_STACK_MARKER),
    );
    if (selectedStack && !games.some((stack) => stack.id === selectedStack.id)) {
      return [selectedStack, ...games];
    }
    return games;
  }, [stacks, selectedStack]);

  const onStackChange = (stack: PortainerStackDto | null) => {
    setValues((current) => ({
      ...current,
      portainerStackId: stack ? String(stack.id) : "",
      identifier:
        mode === "creation" && stack ? identifierFromStackName(stack.name) : current.identifier,
    }));
    setErrors((current) => ({ ...current, portainerStackId: "", identifier: "" }));
    setGlobalError("");
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!values[field].trim()) {
        nextErrors[field] = "Ce champ est obligatoire.";
      }
    });

    // L'identifiant n'est plus saisi : il vient de la stack choisie. Le message doit donc
    // désigner le geste manquant, pas un champ que l'utilisateur ne voit plus.
    if (nextErrors.identifier) {
      nextErrors.identifier = "Choisissez la stack Portainer à lier : elle renseigne l'identifiant.";
    }

    if (values.playersMax.trim()) {
      const asNumber = Number(values.playersMax.trim());
      if (!Number.isFinite(asNumber) || asNumber < 0) {
        nextErrors.playersMax = "Le nombre de joueurs doit etre un entier positif.";
      }
    }

    if (parsePorts(values.ports) === null) {
      nextErrors.ports = "Format attendu : tcp:25565, udp:8211:8211";
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
      setGlobalError("Session invalide.");
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
        await createGamingServerApi(accessToken, payload);
      } else if (mode === "edition" && id) {
        await updateGamingServerApi(accessToken, id, payload);
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la fiche serveur.";
      setGlobalError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldDisabled = isReadOnly || isLoading;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, rgba(7,16,25,1) 0%, rgba(10,22,34,1) 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3} component="form" onSubmit={onSubmit}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/dashboard")}
                  color="inherit"
                >
                  Retour
                </Button>
                <Typography variant="h4" fontWeight={700}>
                  {pageTitle}
                </Typography>
              </Stack>

              {globalError && <Alert severity="error">{globalError}</Alert>}

              {stacksError && (
                <Alert severity="warning">
                  Catalogue Portainer indisponible : {stacksError}. La fiche reste modifiable, mais
                  la stack ne peut pas être choisie dans la liste.
                </Alert>
              )}

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Autocomplete
                  options={stackOptions}
                  value={selectedStack}
                  onChange={(_event, stack) => onStackChange(stack)}
                  getOptionLabel={(stack) => `${stack.name}  (#${stack.id})`}
                  isOptionEqualToValue={(option, selected) => option.id === selected.id}
                  disabled={fieldDisabled || (mode !== "visualisation" && stackOptions.length === 0)}
                  fullWidth
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Stack Portainer *"
                      error={Boolean(errors.portainerStackId || errors.identifier)}
                      helperText={
                        errors.portainerStackId ||
                        errors.identifier ||
                        (values.identifier
                          ? `Identifiant de la fiche : ${values.identifier}`
                          : "Lie la fiche à sa stack et en dérive l'identifiant")
                      }
                    />
                  )}
                />
                <TextField
                  label="Nom *"
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
                  label="Jeu"
                  value={values.gameName}
                  onChange={(event) => onFieldChange("gameName", event.target.value)}
                  disabled={fieldDisabled}
                  fullWidth
                />
                <TextField
                  label="Joueurs max"
                  value={values.playersMax}
                  onChange={(event) => onFieldChange("playersMax", event.target.value)}
                  disabled={fieldDisabled}
                  error={Boolean(errors.playersMax)}
                  helperText={errors.playersMax}
                  fullWidth
                />
              </Stack>

              <TextField
                label="URL de connexion"
                value={values.urlConnection}
                onChange={(event) => onFieldChange("urlConnection", event.target.value)}
                disabled={fieldDisabled}
                fullWidth
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label="Installation"
                  value={values.installation}
                  onChange={(event) => onFieldChange("installation", event.target.value)}
                  disabled={fieldDisabled}
                  fullWidth
                />
                <TextField
                  label="Version"
                  value={values.version}
                  onChange={(event) => onFieldChange("version", event.target.value)}
                  disabled={fieldDisabled}
                  fullWidth
                />
              </Stack>

              <TextField
                label="Ports Freebox"
                value={values.ports}
                onChange={(event) => onFieldChange("ports", event.target.value)}
                disabled={fieldDisabled}
                error={Boolean(errors.ports)}
                helperText={
                  errors.ports ||
                  "Ouverts pendant que le serveur tourne, refermés à l'arrêt. Format : tcp:25565, udp:8211"
                }
                fullWidth
              />

              <TextField
                label="Admins (separes par des virgules)"
                value={values.admins}
                onChange={(event) => onFieldChange("admins", event.target.value)}
                disabled={fieldDisabled}
                fullWidth
              />

              <TextField
                label="Description"
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
    </Box>
  );
}

export default GameServerFormPage;
