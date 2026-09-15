import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  createStaticPortRuleApi,
  deleteStaticPortRuleApi,
  getPortRulesApi,
  getStaticPortRulesApi,
} from "../api/portForwardingApi";
import type { PortRuleDto, StaticPortRuleDto } from "../types/portForwarding";
import { originOf, staticNameOf } from "../types/portForwarding";

interface PortForwardingCardProps {
  token: string;
}

/**
 * Une ligne de la liste : ce que le routeur porte, plus ce que l'application en sait.
 *
 * `staticId` n'est renseigné que pour une règle permanente ; c'est lui qui décide de
 * l'affichage du bouton supprimer. Une règle dérivée d'un serveur n'en a pas : elle se
 * retire en modifiant le serveur, jamais ici, sans quoi le réconciliateur la remettrait
 * à son prochain passage.
 */
interface DisplayRow {
  key: string;
  label: string;
  origin: "static" | "server" | "manual";
  protocol: string;
  wan: string;
  target: string;
  open: boolean;
  onRouter: boolean;
  staticId?: string;
}

const emptyDraft = (): StaticPortRuleDto => ({
  name: "",
  proto: "tcp",
  wanPortStart: 0,
  wanPortEnd: null,
  lanPort: null,
  lanIp: "",
  enabled: true,
});

const portRange = (start: number, end: number) =>
  start === end ? String(start) : `${start}-${end}`;

function PortForwardingCard({ token }: PortForwardingCardProps) {
  const [routerRules, setRouterRules] = useState<PortRuleDto[]>([]);
  const [staticRules, setStaticRules] = useState<StaticPortRuleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<StaticPortRuleDto>(emptyDraft());
  const [isSaving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string>("");

  const load = useCallback(async () => {
    setError("");
    try {
      // Les deux listes disent des choses différentes : l'une l'état du routeur, l'autre ce
      // que l'application détient. Il faut les deux pour savoir quoi afficher et quoi permettre.
      const [rules, statics] = await Promise.all([
        getPortRulesApi(token).catch(() => [] as PortRuleDto[]),
        getStaticPortRulesApi(token),
      ]);
      setRouterRules(rules);
      setStaticRules(statics);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de lire les redirections");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo<DisplayRow[]>(() => {
    const staticByName = new Map(staticRules.map((rule) => [rule.name, rule]));
    const seenStatic = new Set<string>();

    const fromRouter: DisplayRow[] = routerRules.map((rule, index) => {
      const origin = originOf(rule.owner);
      let label = "créée à la main sur la box";
      let staticId: string | undefined;

      if (origin === "static") {
        const name = staticNameOf(rule.owner as string);
        label = name;
        staticId = staticByName.get(name)?.id;
        seenStatic.add(name);
      } else if (origin === "server") {
        label = rule.owner as string;
      }

      return {
        key: rule.providerId ?? `router-${index}`,
        label,
        origin,
        protocol: rule.protocol,
        wan: portRange(rule.wanPortStart, rule.wanPortEnd),
        target: `${rule.lanIp}:${rule.lanPort}`,
        open: rule.open,
        onRouter: true,
        staticId,
      };
    });

    // Une règle permanente enregistrée mais absente du routeur : le dry-run est actif, ou la
    // réconciliation n'est pas encore passée. La masquer donnerait l'impression que l'ajout
    // a échoué.
    const pending: DisplayRow[] = staticRules
      .filter((rule) => !seenStatic.has(rule.name))
      .map((rule) => ({
        key: `pending-${rule.id ?? rule.name}`,
        label: rule.name,
        origin: "static" as const,
        protocol: rule.proto.toUpperCase(),
        wan: portRange(rule.wanPortStart, rule.wanPortEnd ?? rule.wanPortStart),
        target: `${rule.lanIp || "défaut"}:${rule.lanPort ?? rule.wanPortStart}`,
        open: rule.enabled,
        onRouter: false,
        staticId: rule.id,
      }));

    return [...pending, ...fromRouter];
  }, [routerRules, staticRules]);

  const handleCreate = async () => {
    setFormError("");
    if (!draft.name.trim()) {
      setFormError("Le libellé est obligatoire : c'est lui qui identifie la règle sur le routeur.");
      return;
    }
    if (!draft.wanPortStart || draft.wanPortStart < 1 || draft.wanPortStart > 65535) {
      setFormError("Port WAN invalide : attendu entre 1 et 65535.");
      return;
    }

    setSaving(true);
    try {
      await createStaticPortRuleApi(token, {
        ...draft,
        name: draft.name.trim(),
        lanIp: draft.lanIp?.trim() ? draft.lanIp.trim() : null,
      });
      setDialogOpen(false);
      setDraft(emptyDraft());
      setNotice("Règle ajoutée. Le routeur est réaligné dans la foulée.");
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "L'ajout a échoué");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: DisplayRow) => {
    if (!row.staticId) return;
    setDeletingId(row.staticId);
    setError("");
    try {
      await deleteStaticPortRuleApi(token, row.staticId);
      setNotice(`Règle « ${row.label} » supprimée.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "La suppression a échoué");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mb={1}>
          <Box>
            <Typography variant="h6">Redirections de ports</Typography>
            <Typography variant="body2" color="text.secondary">
              Ce que le routeur expose sur Internet. Les redirections d'un serveur de jeu suivent
              son allumage et se modifient depuis sa fiche.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Relire l'état du routeur">
              <IconButton onClick={() => void load()} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setDraft(emptyDraft());
                setFormError("");
                setDialogOpen(true);
              }}
            >
              Ajouter
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}

        {isLoading ? (
          <Stack alignItems="center" py={3}><CircularProgress size={28} /></Stack>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" py={2}>
            Aucune redirection. Le routeur n'expose rien, ou il est injoignable.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Origine</TableCell>
                <TableCell>Libellé</TableCell>
                <TableCell>Port public</TableCell>
                <TableCell>Vers</TableCell>
                <TableCell>État</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key} hover>
                  <TableCell>
                    {row.origin === "static" && <Chip size="small" color="primary" label="Permanente" />}
                    {row.origin === "server" && <Chip size="small" color="secondary" label="Serveur" />}
                    {row.origin === "manual" && <Chip size="small" variant="outlined" label="Manuelle" />}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.label}</Typography>
                    {!row.onRouter && (
                      <Typography variant="caption" color="text.secondary">
                        pas encore posée sur le routeur
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{row.protocol.toLowerCase()}/{row.wan}</TableCell>
                  <TableCell>{row.target}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={row.open ? "success" : "default"}
                      label={row.open ? "ouvert" : "fermé"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.origin === "static" && row.staticId ? (
                      <Tooltip title="Supprimer cette règle permanente">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => void handleDelete(row)}
                            disabled={deletingId === row.staticId}
                          >
                            {deletingId === row.staticId ? <CircularProgress size={18} /> : <DeleteOutlineIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        title={
                          row.origin === "server"
                            ? "Dérivée du serveur « " + row.label + " » : elle se retire depuis sa fiche."
                            : "Créée à la main sur la box. L'application l'observe sans y toucher."
                        }
                      >
                        <span>
                          <IconButton size="small" disabled>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nouvelle redirection permanente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Une règle permanente reste ouverte en permanence, indépendamment de tout serveur de jeu.
            Pour un port qui ne doit s'ouvrir que pendant qu'un serveur tourne, déclarez-le sur la
            fiche du serveur.
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} mt={1}>
            <TextField
              label="Libellé"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              helperText="Identifie la règle sur le routeur, par exemple « wireguard »"
              fullWidth
              autoFocus
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Protocole"
                value={draft.proto}
                onChange={(e) => setDraft({ ...draft, proto: e.target.value })}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="tcp">tcp</MenuItem>
                <MenuItem value="udp">udp</MenuItem>
              </TextField>
              <TextField
                label="Port public"
                type="number"
                value={draft.wanPortStart || ""}
                onChange={(e) => setDraft({ ...draft, wanPortStart: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Fin de plage"
                type="number"
                value={draft.wanPortEnd ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, wanPortEnd: e.target.value ? Number(e.target.value) : null })
                }
                helperText="facultatif"
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="IP LAN"
                value={draft.lanIp ?? ""}
                onChange={(e) => setDraft({ ...draft, lanIp: e.target.value })}
                helperText="vide = valeur par défaut du serveur"
                fullWidth
              />
              <TextField
                label="Port LAN"
                type="number"
                value={draft.lanPort ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, lanPort: e.target.value ? Number(e.target.value) : null })
                }
                helperText="vide = identique au port public"
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isSaving}>Annuler</Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={isSaving}>
            {isSaving ? "Ajout…" : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default PortForwardingCard;
