import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addTeamMemberApi, removeTeamMemberApi, updateTeamMemberApi } from "../../api/teamsApi";
import { RiotAccountPicker } from "../../components/riot/RiotAccountPicker";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  DataTable,
  type DataTableColumn,
  Dialog,
  MultiSelect,
  SelectField,
  Stack,
  Text,
} from "../../design-system";
import {
  GAME_ROLES,
  MEMBER_STATUSES,
  riotIdOf,
  type GameRole,
  type MemberStatus,
  type TeamDto,
  type TeamMemberDto,
} from "../../types/team";
import type { KnownRiotAccountDto } from "../../types/profile";

export interface RosterPanelProps {
  team: TeamDto;
  onTeamChange: (team: TeamDto) => void;
}

export function RosterPanel({ team, onTeamChange }: RosterPanelProps) {
  const { t } = useTranslation("teams");

  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [chosen, setChosen] = useState<KnownRiotAccountDto | null>(null);
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<MemberStatus>("TITULAIRE");

  const [edited, setEdited] = useState<TeamMemberDto | null>(null);
  const [editedRoles, setEditedRoles] = useState<string[]>([]);
  const [editedStatus, setEditedStatus] = useState<MemberStatus>("TITULAIRE");

  const [removed, setRemoved] = useState<TeamMemberDto | null>(null);

  const canEdit = team.viewerCanEdit;

  const roleOptions = GAME_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) }));

  const statusOptions = MEMBER_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }));

  const rolesFor = (status: MemberStatus, roles: string[]): GameRole[] =>
    status === "COACH" ? [] : (roles as GameRole[]);

  const fermerAjout = () => {
    setIsAdding(false);
    setChosen(null);
    setNewRoles([]);
    setNewStatus("TITULAIRE");
  };

  const onAdd = async () => {
    if (!chosen) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      onTeamChange(
        await addTeamMemberApi(team.id, {
          riotGameName: chosen.gameName,
          riotTagLine: chosen.tagLine,
          roles: rolesFor(newStatus, newRoles),
          status: newStatus,
        }),
      );
      fermerAjout();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : t("roster.add.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const onEdit = async () => {
    if (!edited) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      onTeamChange(
        await updateTeamMemberApi(team.id, edited.memberId, {
          roles: rolesFor(editedStatus, editedRoles),
          status: editedStatus,
        }),
      );
      setEdited(null);
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : t("roster.edit.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const onRemove = async () => {
    if (!removed) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      onTeamChange(await removeTeamMemberApi(team.id, removed.memberId));
      setRemoved(null);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : t("roster.remove.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Array<DataTableColumn<TeamMemberDto>> = [
    {
      key: "player",
      header: t("roster.columns.player"),
      width: "22%",
      render: (member) => (
        <Stack direction="row" spacing={1.5} align="center">
          <Avatar src={member.avatarUrl} name={member.displayName} size="small" />
          <Stack spacing={0.5}>
            <Text>
              {member.displayName}
              {member.memberId === team.viewerMemberId ? ` (${t("roster.you")})` : ""}
            </Text>
            {member.captain && <Chip label={t("roster.captain")} tone="primary" variant="outline" />}
          </Stack>
        </Stack>
      ),
    },
    {
      key: "riotId",
      header: t("roster.columns.riotId"),
      width: "20%",
      render: (member) => {
        const riotId = riotIdOf(member);
        return riotId ? (
          <Text tone="secondary">{riotId}</Text>
        ) : (
          <Text tone="disabled">{t("roster.noRiotId")}</Text>
        );
      },
    },
    {
      key: "roles",
      header: t("roster.columns.roles"),
      width: "22%",
      render: (member) =>
        member.roles.length === 0 ? (
          <Text tone="disabled">{t("roster.noRole")}</Text>
        ) : (
          <Stack direction="row" spacing={0.5} wrap>
            {member.roles.map((role) => (
              <Chip key={role} label={t(`roles.${role}`)} variant="outline" size="small" />
            ))}
          </Stack>
        ),
    },
    {
      key: "status",
      header: t("roster.columns.status"),
      width: "12%",
      render: (member) => <Text tone="secondary">{t(`status.${member.status}`)}</Text>,
    },
    {
      key: "account",
      header: t("roster.columns.account"),
      width: "12%",
      render: (member) => (
        <Chip
          label={member.linked ? t("roster.linked") : t("roster.free")}
          tone={member.linked ? "success" : "neutral"}
          variant="outline"
        />
      ),
    },
  ];

  if (canEdit) {
    columns.push({
      key: "actions",
      header: t("roster.columns.actions"),
      align: "right",
      width: "12%",
      render: (member) => (
        <Stack direction="row" spacing={1} justify="end">
          <Button
            size="small"
            variant="ghost"
            onClick={() => {
              setEdited(member);
              setEditedRoles([...member.roles]);
              setEditedStatus(member.status);
            }}
          >
            {t("roster.edit.action")}
          </Button>
          <Button size="small" variant="ghost" onClick={() => setRemoved(member)}>
            {t("roster.remove.action")}
          </Button>
        </Stack>
      ),
    });
  }

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      <Card
        title={t("roster.title")}
        description={t("roster.description")}
        actions={canEdit ? <Button onClick={() => setIsAdding(true)}>{t("roster.add.action")}</Button> : undefined}
      >
        <DataTable
          columns={columns}
          rows={team.members}
          rowKey={(member) => member.memberId}
          caption={t("roster.caption")}
          emptyTitle={t("roster.emptyTitle")}
          emptyDescription={t("roster.emptyDescription")}
          layout="fixed"
          minWidth={840}
        />
      </Card>

      <Dialog
        open={isAdding}
        title={t("roster.add.title")}
        description={t("roster.add.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={chosen ? t("roster.add.confirm") : undefined}
        confirmLoading={isSaving}
        onClose={fermerAjout}
        onConfirm={chosen ? () => void onAdd() : undefined}
      >
        {chosen ? (
          <Stack spacing={2}>
            <Alert severity="success" title={t("roster.add.chosen", { riotId: chosen.riotId })}>
              <Button variant="ghost" size="small" onClick={() => setChosen(null)}>
                {t("roster.add.changeAccount")}
              </Button>
            </Alert>
            <SelectField
              label={t("roster.fields.status")}
              value={newStatus}
              onChange={(value) => setNewStatus(value as MemberStatus)}
              options={statusOptions}
            />
            <MultiSelect
              label={t("roster.fields.roles")}
              values={newStatus === "COACH" ? [] : newRoles}
              onChange={setNewRoles}
              options={roleOptions}
              disabled={newStatus === "COACH"}
              helperText={
                newStatus === "COACH" ? t("roster.fields.coachHasNoRole") : t("roster.fields.rolesHelper")
              }
            />
          </Stack>
        ) : (
          <RiotAccountPicker resetKey={isAdding} busy={isSaving} onPick={setChosen} />
        )}
      </Dialog>

      <Dialog
        open={Boolean(edited)}
        title={t("roster.edit.title", { name: edited?.displayName ?? "" })}
        description={t("roster.edit.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("roster.edit.confirm")}
        confirmLoading={isSaving}
        onClose={() => setEdited(null)}
        onConfirm={() => void onEdit()}
      >
        <Stack spacing={2}>
          <SelectField
            label={t("roster.fields.status")}
            value={editedStatus}
            onChange={(value) => setEditedStatus(value as MemberStatus)}
            options={statusOptions}
          />
          <MultiSelect
            label={t("roster.fields.roles")}
            values={editedStatus === "COACH" ? [] : editedRoles}
            onChange={setEditedRoles}
            options={roleOptions}
            disabled={editedStatus === "COACH"}
            helperText={
              editedStatus === "COACH" ? t("roster.fields.coachHasNoRole") : t("roster.fields.rolesHelper")
            }
          />
        </Stack>
      </Dialog>

      <Dialog
        open={Boolean(removed)}
        title={t("roster.remove.title", { name: removed?.displayName ?? "" })}
        description={t("roster.remove.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("roster.remove.confirm")}
        confirmLoading={isSaving}
        destructive
        onClose={() => setRemoved(null)}
        onConfirm={() => void onRemove()}
      />
    </Stack>
  );
}
