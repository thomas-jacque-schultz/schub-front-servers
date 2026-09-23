import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createCompositionApi,
  deleteCompositionApi,
  getCompositionsApi,
  updateCompositionApi,
} from "../../api/teamsApi";
import {
  Alert,
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  Dialog,
  EmptyState,
  ProgressBar,
  SelectField,
  Stack,
  Text,
  TextField,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import {
  GAME_ROLES,
  playableMembers,
  type CompositionDto,
  type CompositionSlotDto,
  type GameRole,
  type TeamDto,
} from "../../types/team";

export interface DraftPanelProps {
  team: TeamDto;
}

interface SlotDraft {
  role: GameRole;
  championId: string;
  memberId: string;
}

const UNASSIGNED = "";

const emptySlots = (): SlotDraft[] =>
  GAME_ROLES.map((role) => ({ role, championId: "", memberId: UNASSIGNED }));

const slotsOf = (composition: CompositionDto): SlotDraft[] =>
  GAME_ROLES.map((role) => {
    const slot = composition.slots.find((candidate) => candidate.role === role);
    return {
      role,
      championId: slot?.championId ?? "",
      memberId: slot?.memberId ?? UNASSIGNED,
    };
  });

export function DraftPanel({ team }: DraftPanelProps) {
  const { t } = useTranslation("teams");
  const { formatDateTime } = useLocaleFormat();

  const [compositions, setCompositions] = useState<CompositionDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [editing, setEditing] = useState<CompositionDto | "new" | null>(null);
  const [name, setName] = useState<string>("");
  const [patch, setPatch] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [slots, setSlots] = useState<SlotDraft[]>(emptySlots());
  const [formError, setFormError] = useState<string>("");

  const [removed, setRemoved] = useState<CompositionDto | null>(null);

  const canEdit = team.viewerCanEditCompositions;
  const players = playableMembers(team.members);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCompositions(await getCompositionsApi(team.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("draft.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [team.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing("new");
    setName("");
    setPatch("");
    setNotes("");
    setSlots(emptySlots());
    setFormError("");
  };

  const openEdit = (composition: CompositionDto) => {
    setEditing(composition);
    setName(composition.name);
    setPatch(composition.patch ?? "");
    setNotes(composition.notes ?? "");
    setSlots(slotsOf(composition));
    setFormError("");
  };

  const setSlot = (role: GameRole, patchSlot: Partial<SlotDraft>) => {
    setSlots((current) =>
      current.map((slot) => (slot.role === role ? { ...slot, ...patchSlot } : slot)),
    );
  };

  const invalidReason = (): string | null => {
    if (!name.trim()) {
      return t("draft.validation.nameRequired");
    }
    if (slots.some((slot) => !slot.championId.trim())) {
      return t("draft.validation.championRequired");
    }
    const designated = slots.map((slot) => slot.memberId).filter((memberId) => memberId !== UNASSIGNED);
    if (new Set(designated).size !== designated.length) {
      return t("draft.validation.duplicatePlayer");
    }
    return null;
  };

  const onSave = async () => {
    const reason = invalidReason();
    if (reason) {
      setFormError(reason);
      return;
    }
    setIsSaving(true);
    setFormError("");
    try {
      const request = {
        name: name.trim(),
        slots: slots.map((slot) => ({
          role: slot.role,
          championId: slot.championId.trim(),
          memberId: slot.memberId === UNASSIGNED ? null : slot.memberId,
        })),
        patch: patch.trim() || null,
        notes: notes.trim() || null,
      };
      if (editing === "new") {
        await createCompositionApi(team.id, request);
      } else if (editing) {
        await updateCompositionApi(team.id, editing.id, request);
      }
      setEditing(null);
      await load();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : t("draft.create.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!removed) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await deleteCompositionApi(team.id, removed.id);
      setRemoved(null);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("draft.delete.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Array<DataTableColumn<CompositionSlotDto>> = [
    {
      key: "role",
      header: t("draft.columns.role"),
      width: 140,
      render: (slot) => <Text>{t(`roles.${slot.role}`)}</Text>,
    },
    {
      key: "champion",
      header: t("draft.columns.champion"),
      render: (slot) => <Text>{slot.championId}</Text>,
    },
    {
      key: "player",
      header: t("draft.columns.player"),
      render: (slot) =>
        slot.playerDisplayName ? (
          <Text tone="secondary">{slot.playerDisplayName}</Text>
        ) : (
          <Text tone="disabled">{t("draft.unassigned")}</Text>
        ),
    },
  ];

  const playerOptionsFor = (role: GameRole) => {
    const duPoste = players.filter((member) => member.roles.includes(role));
    const autres = players.filter((member) => !member.roles.includes(role));
    return [
      { value: UNASSIGNED, label: t("draft.fields.playerNone") },
      ...duPoste.map((member) => ({ value: member.memberId, label: member.displayName })),
      ...autres.map((member) => ({
        value: member.memberId,
        label: t("draft.fields.playerOffRole", {
          name: member.displayName,
          roles:
            member.roles.length === 0
              ? t("draft.fields.playerNoRole")
              : member.roles.map((autre) => t(`roles.${autre}`)).join(" · "),
        }),
      })),
    ];
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card
        title={t("draft.title")}
        description={t("draft.description")}
        actions={canEdit ? <Button onClick={openCreate}>{t("draft.create.action")}</Button> : undefined}
      >
        {isLoading && <ProgressBar label={t("draft.title")} />}
        {!isLoading && compositions.length === 0 && (
          <EmptyState title={t("draft.emptyTitle")} description={t("draft.emptyDescription")} />
        )}
      </Card>

      {compositions.map((composition) => (
        <Card
          key={composition.id}
          title={composition.name}
          description={`${
            composition.patch ? t("draft.patch", { patch: composition.patch }) : t("draft.noPatch")
          } · ${t("draft.updated", { date: formatDateTime(new Date(composition.updatedAt)) })}`}
          actions={
            composition.viewerCanEdit ? (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="ghost" onClick={() => openEdit(composition)}>
                  {t("draft.edit.action")}
                </Button>
                <Button size="small" variant="ghost" onClick={() => setRemoved(composition)}>
                  {t("draft.delete.action")}
                </Button>
              </Stack>
            ) : undefined
          }
        >
          <Stack spacing={1.5}>
            <DataTable
              columns={columns}
              rows={composition.slots}
              rowKey={(slot) => slot.role}
              caption={composition.name}
              emptyTitle={t("draft.emptyTitle")}
              dense
            />
            {composition.notes && <Text tone="secondary">{composition.notes}</Text>}
          </Stack>
        </Card>
      ))}

      <Dialog
        open={editing !== null}
        title={
          editing === "new" || editing === null
            ? t("draft.create.title")
            : t("draft.edit.title", { name: editing.name })
        }
        maxWidth="md"
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={editing === "new" ? t("draft.create.confirm") : t("draft.edit.confirm")}
        confirmLoading={isSaving}
        onClose={() => setEditing(null)}
        onConfirm={() => void onSave()}
      >
        <Stack spacing={2}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label={t("draft.fields.name")}
            value={name}
            onChange={setName}
            helperText={t("draft.fields.nameHelper")}
            required
            autoFocus
          />
          <TextField
            label={t("draft.fields.patch")}
            value={patch}
            onChange={setPatch}
            helperText={t("draft.fields.patchHelper")}
          />
          {slots.map((slot) => (
            <Stack key={slot.role} direction="responsive" spacing={2} align="start">
              <TextField
                label={t("draft.fields.champion", { role: t(`roles.${slot.role}`) })}
                value={slot.championId}
                onChange={(value) => setSlot(slot.role, { championId: value })}
                helperText={t("draft.fields.championHelper")}
                required
              />
              <SelectField
                label={t("draft.fields.player", { role: t(`roles.${slot.role}`) })}
                value={slot.memberId}
                onChange={(value) => setSlot(slot.role, { memberId: value })}
                options={playerOptionsFor(slot.role)}
                helperText={t("draft.fields.playerHelper")}
              />
            </Stack>
          ))}
          <TextField
            label={t("draft.fields.notes")}
            value={notes}
            onChange={setNotes}
            helperText={t("draft.fields.notesHelper")}
            multiline
            minRows={2}
          />
        </Stack>
      </Dialog>

      <Dialog
        open={Boolean(removed)}
        title={t("draft.delete.title", { name: removed?.name ?? "" })}
        description={t("draft.delete.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("draft.delete.confirm")}
        confirmLoading={isSaving}
        destructive
        onClose={() => setRemoved(null)}
        onConfirm={() => void onDelete()}
      />
    </Stack>
  );
}
