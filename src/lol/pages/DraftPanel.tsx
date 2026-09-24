import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getChampionPoolApi } from "../api/poolApi";
import {
  createCompositionApi,
  deleteCompositionApi,
  getCompositionsApi,
  updateCompositionApi,
} from "../api/teamsApi";
import {
  Alert,
  AvatarSelect,
  type AvatarSelectOption,
  Button,
  Card,
  ChampionIcon,
  ChampionPickButton,
  ChampionSelector,
  DataTable,
  type DataTableColumn,
  Dialog,
  EmptyState,
  Frame,
  ProgressBar,
  Stack,
  Text,
  TextField,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import type { ChampionCatalogEntryDto } from "../types/pool";
import {
  GAME_ROLES,
  playableMembers,
  type CompositionDto,
  type CompositionSlotDto,
  type GameRole,
  type TeamDto,
} from "../types/team";
import { selectorEntries } from "./pool/catalog";

export interface DraftPanelProps {
  team: TeamDto;
}

interface SlotDraft {
  role: GameRole;
  championId: string | null;
  memberId: string | null;
  alternatives: string[];
}

type Selecteur = { kind: "pick" | "alternatives"; role: GameRole } | { kind: "bans" };

const BANS_MAX = 5;

const emptySlots = (): SlotDraft[] =>
  GAME_ROLES.map((role) => ({
    role,
    championId: null,
    memberId: null,
    alternatives: [],
  }));

const slotsOf = (composition: CompositionDto): SlotDraft[] =>
  GAME_ROLES.map((role) => {
    const slot = composition.slots.find((candidate) => candidate.role === role);
    return {
      role,
      championId: slot?.championId ?? null,
      memberId: slot?.memberId ?? null,
      alternatives: slot?.alternatives ?? [],
    };
  });

export function DraftPanel({ team }: DraftPanelProps) {
  const { t } = useTranslation("teams");
  const { formatDateTime } = useLocaleFormat();

  const [compositions, setCompositions] = useState<CompositionDto[]>([]);
  const [catalog, setCatalog] = useState<ChampionCatalogEntryDto[]>([]);
  const [catalogPatch, setCatalogPatch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [editing, setEditing] = useState<CompositionDto | "new" | null>(null);
  const [name, setName] = useState<string>("");
  const [patch, setPatch] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [slots, setSlots] = useState<SlotDraft[]>(emptySlots());
  const [bans, setBans] = useState<string[]>([]);
  const [selecteur, setSelecteur] = useState<Selecteur | null>(null);
  const [formError, setFormError] = useState<string>("");

  const [removed, setRemoved] = useState<CompositionDto | null>(null);

  const canEdit = team.viewerCanEditCompositions;
  const players = playableMembers(team.members);
  const entries = selectorEntries(catalog);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const [compos, pool] = await Promise.allSettled([
      getCompositionsApi(team.id),
      getChampionPoolApi(team.id),
    ]);
    if (compos.status === "fulfilled") {
      setCompositions(compos.value);
    } else {
      setError(compos.reason instanceof Error ? compos.reason.message : t("draft.loadFailed"));
    }
    if (pool.status === "fulfilled") {
      setCatalog(pool.value.catalog);
      setCatalogPatch(pool.value.patch);
    }
    setIsLoading(false);
  }, [team.id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const champion = (key: string) => {
    const entry = catalog.find((candidate) => candidate.championKey === key);
    return { name: entry?.name ?? key, iconUrl: entry?.iconUrl ?? null };
  };

  const openCreate = () => {
    setEditing("new");
    setName("");
    setPatch(catalogPatch ?? "");
    setNotes("");
    setSlots(emptySlots());
    setBans([]);
    setSelecteur(null);
    setFormError("");
  };

  const openEdit = (composition: CompositionDto) => {
    setEditing(composition);
    setName(composition.name);
    setPatch(composition.patch ?? "");
    setNotes(composition.notes ?? "");
    setSlots(slotsOf(composition));
    setBans(composition.bans);
    setSelecteur(null);
    setFormError("");
  };

  const setSlot = (role: GameRole, patchSlot: Partial<SlotDraft>) => {
    setSlots((current) =>
      current.map((slot) => (slot.role === role ? { ...slot, ...patchSlot } : slot)),
    );
  };

  const assignPlayer = (role: GameRole, memberId: string | null) => {
    setSlots((current) =>
      current.map((slot) => {
        if (slot.role === role) {
          return { ...slot, memberId };
        }
        return memberId !== null && slot.memberId === memberId ? { ...slot, memberId: null } : slot;
      }),
    );
  };

  const bascule = (cible: Selecteur) =>
    setSelecteur((courant) =>
      courant &&
      courant.kind === cible.kind &&
      (cible.kind === "bans" || (courant.kind !== "bans" && courant.role === cible.role))
        ? null
        : cible,
    );

  const estOuvert = (kind: Selecteur["kind"], role?: GameRole) =>
    selecteur !== null &&
    selecteur.kind === kind &&
    (selecteur.kind === "bans" || selecteur.role === role);

  const picks = slots.map((slot) => slot.championId).filter((key): key is string => key !== null);

  const indisponibles = (cible: Selecteur): string[] => {
    if (cible.kind === "bans") {
      const pris = [...picks, ...slots.flatMap((slot) => slot.alternatives)];
      return bans.length >= BANS_MAX
        ? entries.map((entry) => entry.key).filter((key) => !bans.includes(key))
        : pris;
    }
    const slot = slots.find((candidate) => candidate.role === cible.role);
    if (cible.kind === "pick") {
      return [...bans, ...picks.filter((key) => key !== slot?.championId)];
    }
    return [...bans, ...(slot?.championId ? [slot.championId] : [])];
  };

  const playerOptionsFor = (role: GameRole): AvatarSelectOption[] => {
    const duPoste = players.filter((member) => member.roles.includes(role));
    const autres = players.filter((member) => !member.roles.includes(role));
    return [...duPoste, ...autres].map((member) => {
      const ailleurs = slots.find(
        (slot) => slot.role !== role && slot.memberId === member.memberId,
      );
      let hint: string | undefined;
      if (ailleurs) {
        hint = t("draft.fields.playerTaken", {
          name: member.displayName,
          role: t(`roles.${ailleurs.role}`),
        });
      } else if (!member.roles.includes(role)) {
        hint =
          member.roles.length === 0
            ? t("draft.fields.playerNoRole", { name: member.displayName })
            : t("draft.fields.playerOffRole", {
                name: member.displayName,
                roles: member.roles.map((autre) => t(`roles.${autre}`)).join(" · "),
              });
      }
      return {
        value: member.memberId,
        name: member.displayName,
        src: member.avatarUrl,
        hint,
        taken: Boolean(ailleurs),
      };
    });
  };

  const invalidReason = (): string | null => {
    if (!name.trim()) {
      return t("draft.validation.nameRequired");
    }
    if (slots.some((slot) => slot.championId === null)) {
      return t("draft.validation.championRequired");
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
          championId: slot.championId ?? "",
          memberId: slot.memberId,
          alternatives: slot.alternatives,
        })),
        bans,
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

  const icones = (keys: string[]) => (
    <Stack direction="row" spacing={0.5} wrap>
      {keys.map((key) => (
        <ChampionIcon
          key={key}
          size="small"
          name={champion(key).name}
          src={champion(key).iconUrl}
        />
      ))}
    </Stack>
  );

  const columns: Array<DataTableColumn<CompositionSlotDto>> = [
    {
      key: "role",
      header: t("draft.columns.role"),
      width: 100,
      render: (slot) => <Text>{t(`roles.${slot.role}`)}</Text>,
    },
    {
      key: "champion",
      header: t("draft.columns.champion"),
      render: (slot) =>
        slot.championId ? (
          <Stack direction="row" spacing={1} align="center">
            <ChampionIcon
              size="small"
              name={champion(slot.championId).name}
              src={champion(slot.championId).iconUrl}
            />
            <Text>{champion(slot.championId).name}</Text>
          </Stack>
        ) : null,
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
    {
      key: "alternatives",
      header: t("draft.columns.alternatives"),
      render: (slot) => icones(slot.alternatives),
    },
  ];

  const selecteurDe = (
    cible: Selecteur,
    selected: string[],
    onChange: (keys: string[]) => void,
  ) => (
    <ChampionSelector
      entries={entries}
      mode={cible.kind === "pick" ? "single" : "multiple"}
      selected={selected}
      onChange={onChange}
      disabledKeys={indisponibles(cible)}
      searchLabel={t("draft.fields.search")}
      searchPlaceholder={t("draft.fields.searchPlaceholder")}
      noResultLabel={t("draft.fields.noResult")}
      autoFocus
    />
  );

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card
        title={t("draft.title")}
        description={t("draft.description")}
        actions={
          canEdit ? <Button onClick={openCreate}>{t("draft.create.action")}</Button> : undefined
        }
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
            <Stack direction="row" spacing={1} align="center">
              <Text variant="overline" tone="secondary">
                {t("draft.bans")}
              </Text>
              {composition.bans.length === 0 ? (
                <Text variant="caption" tone="disabled">
                  {t("draft.noBans")}
                </Text>
              ) : (
                icones(composition.bans)
              )}
            </Stack>
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
        maxWidth="lg"
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={editing === "new" ? t("draft.create.confirm") : t("draft.edit.confirm")}
        confirmLoading={isSaving}
        onClose={() => setEditing(null)}
        onConfirm={() => void onSave()}
      >
        <Stack spacing={2}>
          {formError && <Alert severity="error">{formError}</Alert>}
          {catalog.length === 0 && (
            <Alert severity="warning">{t("draft.fields.catalogMissing")}</Alert>
          )}
          <Stack direction="responsive" spacing={2} align="start">
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
          </Stack>

          {slots.map((slot) => {
            const poste = t(`roles.${slot.role}`);
            return (
              <Frame
                key={slot.role}
                dense
                accent={estOuvert("pick", slot.role) || estOuvert("alternatives", slot.role)}
              >
                <Stack spacing={1.5}>
                  <Stack direction="responsive" spacing={2} align="center" justify="between">
                    <Stack direction="row" spacing={2} align="center">
                      <Text variant="overline" mono>
                        {poste}
                      </Text>
                      <ChampionPickButton
                        champion={slot.championId ? champion(slot.championId) : null}
                        label={t("draft.fields.championChoose", {
                          role: poste,
                        })}
                        onClick={() => bascule({ kind: "pick", role: slot.role })}
                        active={estOuvert("pick", slot.role)}
                      />
                      <AvatarSelect
                        label={t("draft.fields.players", { role: poste })}
                        options={playerOptionsFor(slot.role)}
                        value={slot.memberId}
                        onChange={(memberId) => assignPlayer(slot.role, memberId)}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1} align="center">
                      <Text variant="caption" tone="secondary">
                        {t("draft.columns.alternatives")}
                      </Text>
                      {icones(slot.alternatives)}
                      <ChampionPickButton
                        size="small"
                        label={t("draft.fields.alternativesAdd", {
                          role: poste,
                        })}
                        onClick={() => bascule({ kind: "alternatives", role: slot.role })}
                        active={estOuvert("alternatives", slot.role)}
                      />
                    </Stack>
                  </Stack>
                  {estOuvert("pick", slot.role) &&
                    selecteurDe(
                      { kind: "pick", role: slot.role },
                      slot.championId ? [slot.championId] : [],
                      (keys) => {
                        setSlot(slot.role, { championId: keys[0] ?? null });
                        setSelecteur(null);
                      },
                    )}
                  {estOuvert("alternatives", slot.role) &&
                    selecteurDe(
                      { kind: "alternatives", role: slot.role },
                      slot.alternatives,
                      (keys) => setSlot(slot.role, { alternatives: keys }),
                    )}
                </Stack>
              </Frame>
            );
          })}

          <Frame dense accent={estOuvert("bans")}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} align="center">
                <Text variant="overline" mono>
                  {t("draft.fields.bans", {
                    count: bans.length,
                    max: BANS_MAX,
                  })}
                </Text>
                {icones(bans)}
                <ChampionPickButton
                  size="small"
                  label={t("draft.fields.bansAdd")}
                  onClick={() => bascule({ kind: "bans" })}
                  active={estOuvert("bans")}
                />
              </Stack>
              <Text variant="caption" tone="secondary">
                {t("draft.fields.bansHelper")}
              </Text>
              {estOuvert("bans") && selecteurDe({ kind: "bans" }, bans, setBans)}
            </Stack>
          </Frame>

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
