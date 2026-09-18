import { useMemo, useState } from "react";
import {
  Alert,
  Box,
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
import { useTranslation } from "react-i18next";
import { Button, EmptyState } from "../design-system";
import type { PortRuleDto, StaticPortRuleDto } from "../types/portForwarding";
import { originOf, staticNameOf } from "../types/portForwarding";

interface PortForwardingCardProps {
  routerRules: PortRuleDto[];
  staticRules: StaticPortRuleDto[];
  isLoading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  onCreate: (rule: StaticPortRuleDto) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  /**
   * Faux pour `PORT_VIEW` sans `PORT_RULE_EDIT` : la carte se lit, elle ne s'écrit pas.
   *
   * <p>Les deux permissions sont distinctes côté cœur, et modifier une redirection est un
   * pouvoir global — c'est écrire dans la table du routeur. Montrer les boutons à qui n'a que
   * la lecture ne ferait que produire des 403 en série.</p>
   */
  canEdit?: boolean;
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

function PortForwardingCard({
  routerRules,
  staticRules,
  isLoading,
  error,
  onRefresh,
  onCreate,
  onDelete,
  canEdit = true,
}: PortForwardingCardProps) {
  const { t } = useTranslation("ports");

  // Seul l'état d'interface vit ici : la boîte de dialogue, le brouillon en cours de saisie
  // et les messages consécutifs à une action. Les redirections, elles, appartiennent au store.
  const [notice, setNotice] = useState<string>("");
  const [actionError, setActionError] = useState<string>("");

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<StaticPortRuleDto>(emptyDraft());
  const [isSaving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string>("");

  const rows = useMemo<DisplayRow[]>(() => {
    const staticByName = new Map(staticRules.map((rule) => [rule.name, rule]));
    const seenStatic = new Set<string>();

    const fromRouter: DisplayRow[] = routerRules.map((rule, index) => {
      const origin = originOf(rule.owner);
      let label = t("origin.manualLabel");
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
        target: `${rule.lanIp || "—"}:${rule.lanPort ?? rule.wanPortStart}`,
        open: rule.enabled,
        onRouter: false,
        staticId: rule.id,
      }));

    return [...pending, ...fromRouter];
  }, [routerRules, staticRules, t]);

  const handleCreate = async () => {
    setFormError("");
    if (!draft.name.trim()) {
      setFormError(t("feedback.labelRequired"));
      return;
    }
    if (!draft.wanPortStart || draft.wanPortStart < 1 || draft.wanPortStart > 65535) {
      setFormError(t("feedback.wanPortInvalid"));
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        ...draft,
        name: draft.name.trim(),
        lanIp: draft.lanIp?.trim() ? draft.lanIp.trim() : null,
      });
      setDialogOpen(false);
      setDraft(emptyDraft());
      setNotice(t("feedback.created"));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : t("feedback.createFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: DisplayRow) => {
    if (!row.staticId) return;
    setDeletingId(row.staticId);
    setActionError("");
    try {
      await onDelete(row.staticId);
      setNotice(t("feedback.deleted", { label: row.label }));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : t("feedback.deleteFailed"));
    } finally {
      setDeletingId("");
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mb={1}>
          <Box>
            <Typography variant="h6">{t("card.title")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("card.description")}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t("card.refresh")}>
              <IconButton onClick={() => void onRefresh()} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setDraft(emptyDraft());
                  setFormError("");
                  setDialogOpen(true);
                }}
              >
                {t("actions.add", { ns: "common" })}
              </Button>
            )}
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>{actionError}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}

        {isLoading ? (
          <Stack alignItems="center" py={3}><CircularProgress size={28} /></Stack>
        ) : rows.length === 0 ? (
          <EmptyState title={t("card.emptyTitle")} description={t("card.emptyDescription")} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("table.origin")}</TableCell>
                <TableCell>{t("table.label")}</TableCell>
                <TableCell>{t("table.wanPort")}</TableCell>
                <TableCell>{t("table.target")}</TableCell>
                <TableCell>{t("table.state")}</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key} hover>
                  <TableCell>
                    {row.origin === "static" && <Chip size="small" color="primary" label={t("origin.static")} />}
                    {row.origin === "server" && <Chip size="small" color="secondary" label={t("origin.server")} />}
                    {row.origin === "manual" && <Chip size="small" variant="outlined" label={t("origin.manual")} />}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.label}</Typography>
                    {!row.onRouter && (
                      <Typography variant="caption" color="text.secondary">
                        {t("state.notOnRouter")}
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
                      label={row.open ? t("state.open") : t("state.closed")}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {canEdit && row.origin === "static" && row.staticId ? (
                      <Tooltip title={t("row.deleteStatic")}>
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
                            ? t("row.deleteFromServer", { label: row.label })
                            : t("row.deleteManual")
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
        <DialogTitle>{t("dialog.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t("dialog.description")}
          </Typography>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} mt={1}>
            <TextField
              label={t("dialog.fields.label")}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              helperText={t("dialog.helpers.label")}
              fullWidth
              autoFocus
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label={t("dialog.fields.proto")}
                value={draft.proto}
                onChange={(e) => setDraft({ ...draft, proto: e.target.value })}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="tcp">tcp</MenuItem>
                <MenuItem value="udp">udp</MenuItem>
              </TextField>
              <TextField
                label={t("dialog.fields.wanPort")}
                type="number"
                value={draft.wanPortStart || ""}
                onChange={(e) => setDraft({ ...draft, wanPortStart: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label={t("dialog.fields.wanPortEnd")}
                type="number"
                value={draft.wanPortEnd ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, wanPortEnd: e.target.value ? Number(e.target.value) : null })
                }
                helperText={t("dialog.helpers.optional")}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label={t("dialog.fields.lanIp")}
                value={draft.lanIp ?? ""}
                onChange={(e) => setDraft({ ...draft, lanIp: e.target.value })}
                helperText={t("dialog.helpers.lanIp")}
                fullWidth
              />
              <TextField
                label={t("dialog.fields.lanPort")}
                type="number"
                value={draft.lanPort ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, lanPort: e.target.value ? Number(e.target.value) : null })
                }
                helperText={t("dialog.helpers.lanPort")}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={isSaving}>
            {t("actions.cancel", { ns: "common" })}
          </Button>
          <Button onClick={() => void handleCreate()} loading={isSaving}>
            {t("actions.add", { ns: "common" })}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default PortForwardingCard;
