import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  Chip,
  DataTable,
  Dialog,
  Icon,
  IconButton,
  SelectField,
  Spinner,
  Stack,
  Text,
  TextField,
} from "../design-system";
import type { DataTableColumn } from "../design-system";
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

const portRange = (start: number, end: number) => (start === end ? String(start) : `${start}-${end}`);

/**
 * Les redirections de ports.
 *
 * <p>Migrée vers les primitives au lot B.5 : le tableau écrit en JSX devient un
 * {@link DataTable} à colonnes déclarées, et la boîte de dialogue le {@link Dialog} du design
 * system. C'est le dernier des trois écrans du bloc « dette à résorber ».</p>
 */
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

  const columns: Array<DataTableColumn<DisplayRow>> = [
    {
      key: "origin",
      header: t("table.origin"),
      render: (row) => {
        if (row.origin === "static") {
          return <Chip tone="primary" label={t("origin.static")} />;
        }
        if (row.origin === "server") {
          return <Chip tone="secondary" label={t("origin.server")} />;
        }
        return <Chip variant="outline" label={t("origin.manual")} />;
      },
    },
    {
      key: "label",
      header: t("table.label"),
      render: (row) => (
        <>
          <Text variant="caption">{row.label}</Text>
          {!row.onRouter && (
            <Text variant="caption" tone="secondary">
              {t("state.notOnRouter")}
            </Text>
          )}
        </>
      ),
    },
    {
      key: "wan",
      header: t("table.wanPort"),
      render: (row) => `${row.protocol.toLowerCase()}/${row.wan}`,
    },
    { key: "target", header: t("table.target"), render: (row) => row.target },
    {
      key: "state",
      header: t("table.state"),
      render: (row) => (
        <Chip
          variant="outline"
          tone={row.open ? "success" : "neutral"}
          label={row.open ? t("state.open") : t("state.closed")}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: 72,
      render: (row) =>
        canEdit && row.origin === "static" && row.staticId ? (
          <IconButton
            icon="delete"
            size="small"
            destructive
            label={t("row.deleteStatic")}
            loading={deletingId === row.staticId}
            onClick={() => void handleDelete(row)}
          />
        ) : (
          <IconButton
            icon="delete"
            size="small"
            disabled
            label={
              row.origin === "server"
                ? t("row.deleteFromServer", { label: row.label })
                : t("row.deleteManual")
            }
          />
        ),
    },
  ];

  return (
    <Card
      title={t("card.title")}
      description={t("card.description")}
      actions={
        <>
          <IconButton
            icon="refresh"
            label={t("card.refresh")}
            disabled={isLoading}
            onClick={() => void onRefresh()}
          />
          {canEdit && (
            <Button
              startIcon={<Icon name="add" size="small" />}
              onClick={() => {
                setDraft(emptyDraft());
                setFormError("");
                setDialogOpen(true);
              }}
            >
              {t("actions.add", { ns: "common" })}
            </Button>
          )}
        </>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {actionError && (
          <Alert severity="error" onClose={() => setActionError("")}>
            {actionError}
          </Alert>
        )}
        {notice && (
          <Alert severity="success" onClose={() => setNotice("")}>
            {notice}
          </Alert>
        )}

        {isLoading ? (
          <Stack align="center" spacing={3}>
            <Spinner label={t("card.title")} />
          </Stack>
        ) : (
          <DataTable
            dense
            columns={columns}
            rows={rows}
            rowKey={(row) => row.key}
            caption={t("card.title")}
            emptyTitle={t("card.emptyTitle")}
            emptyDescription={t("card.emptyDescription")}
          />
        )}
      </Stack>

      <Dialog
        open={isDialogOpen}
        title={t("dialog.title")}
        description={t("dialog.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("actions.add", { ns: "common" })}
        confirmLoading={isSaving}
        onConfirm={() => void handleCreate()}
        onClose={() => setDialogOpen(false)}
      >
        <Stack spacing={2}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label={t("dialog.fields.label")}
            value={draft.name}
            onChange={(value) => setDraft({ ...draft, name: value })}
            helperText={t("dialog.helpers.label")}
            fullWidth
            autoFocus
          />
          <Stack direction="responsive" spacing={2}>
            <SelectField
              label={t("dialog.fields.proto")}
              value={draft.proto}
              onChange={(value) => setDraft({ ...draft, proto: value })}
              options={[
                { value: "tcp", label: "tcp" },
                { value: "udp", label: "udp" },
              ]}
            />
            <TextField
              label={t("dialog.fields.wanPort")}
              type="number"
              value={draft.wanPortStart ? String(draft.wanPortStart) : ""}
              onChange={(value) => setDraft({ ...draft, wanPortStart: Number(value) })}
              fullWidth
            />
            <TextField
              label={t("dialog.fields.wanPortEnd")}
              type="number"
              value={draft.wanPortEnd != null ? String(draft.wanPortEnd) : ""}
              onChange={(value) => setDraft({ ...draft, wanPortEnd: value ? Number(value) : null })}
              helperText={t("dialog.helpers.optional")}
              fullWidth
            />
          </Stack>
          <Stack direction="responsive" spacing={2}>
            <TextField
              label={t("dialog.fields.lanIp")}
              value={draft.lanIp ?? ""}
              onChange={(value) => setDraft({ ...draft, lanIp: value })}
              helperText={t("dialog.helpers.lanIp")}
              fullWidth
            />
            <TextField
              label={t("dialog.fields.lanPort")}
              type="number"
              value={draft.lanPort != null ? String(draft.lanPort) : ""}
              onChange={(value) => setDraft({ ...draft, lanPort: value ? Number(value) : null })}
              helperText={t("dialog.helpers.lanPort")}
              fullWidth
            />
          </Stack>
        </Stack>
      </Dialog>
    </Card>
  );
}

export default PortForwardingCard;
