import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addTeamMemberApi, removeTeamMemberApi, updateTeamMemberApi } from "../api/teamsApi";
import { RiotAccountPicker } from "../components/RiotAccountPicker";
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
  Stack,
  Text,
} from "../../design-system";
import {
  choisitStatuts,
  GAME_ROLES,
  MEMBER_STATUSES,
  riotIdOf,
  statutsOf,
  versRequete,
  type GameRole,
  type MemberStatus,
  type TeamDto,
  type TeamMemberDto,
} from "../types/team";
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
  const [newStatuts, setNewStatuts] = useState<MemberStatus[]>(["TITULAIRE"]);

  const [edited, setEdited] = useState<TeamMemberDto | null>(null);
  const [editedRoles, setEditedRoles] = useState<string[]>([]);
  const [editedStatuts, setEditedStatuts] = useState<MemberStatus[]>(["TITULAIRE"]);

  const [removed, setRemoved] = useState<TeamMemberDto | null>(null);

  const canEdit = team.viewerCanEdit;

  const roleOptions = GAME_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) }));

  const statusOptions = MEMBER_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }));

  const coachSeul = (statuts: MemberStatus[]) => statuts.length === 1 && statuts[0] === "COACH";

  const rolesFor = (statuts: MemberStatus[], roles: string[]): GameRole[] =>
    coachSeul(statuts) ? [] : (roles as GameRole[]);

  const fermerAjout = () => {
    setIsAdding(false);
    setChosen(null);
    setNewRoles([]);
    setNewStatuts(["TITULAIRE"]);
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
          roles: rolesFor(newStatuts, newRoles),
          ...versRequete(newStatuts),
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
          roles: rolesFor(editedStatuts, editedRoles),
          ...versRequete(editedStatuts),
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
          <Text>
            {member.displayName}
            {member.memberId === team.viewerMemberId ? ` (${t("roster.you")})` : ""}
          </Text>
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
      render: (member) => (
        <Stack direction="row" spacing={0.5} wrap>
          {statutsOf(member).map((statut) => (
            <Chip
              key={statut}
              label={t(`status.${statut}`)}
              tone={statut === "COACH" ? "primary" : "neutral"}
              variant="outline"
              size="small"
            />
          ))}
        </Stack>
      ),
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
              setEditedStatuts(statutsOf(member));
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
          rowAccent={(member) => member.coach}
        />
      </Card>

      <Dialog
        open={isAdding}
        title={t("roster.add.title")}
        description={t("roster.add.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={chosen ? t("roster.add.confirm") : undefined}
        confirmDisabled={newStatuts.length === 0}
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
            <MultiSelect
              label={t("roster.fields.status")}
              values={newStatuts}
              onChange={(values) => setNewStatuts(choisitStatuts(newStatuts, values as MemberStatus[]))}
              options={statusOptions}
              helperText={t("roster.fields.statusHelper")}
            />
            <MultiSelect
              label={t("roster.fields.roles")}
              values={coachSeul(newStatuts) ? [] : newRoles}
              onChange={setNewRoles}
              options={roleOptions}
              disabled={coachSeul(newStatuts)}
              helperText={
                coachSeul(newStatuts) ? t("roster.fields.coachHasNoRole") : t("roster.fields.rolesHelper")
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
        confirmDisabled={editedStatuts.length === 0}
        confirmLoading={isSaving}
        onClose={() => setEdited(null)}
        onConfirm={() => void onEdit()}
      >
        <Stack spacing={2}>
          <MultiSelect
            label={t("roster.fields.status")}
            values={editedStatuts}
            onChange={(values) => setEditedStatuts(choisitStatuts(editedStatuts, values as MemberStatus[]))}
            options={statusOptions}
            helperText={t("roster.fields.statusHelper")}
          />
          <MultiSelect
            label={t("roster.fields.roles")}
            values={coachSeul(editedStatuts) ? [] : editedRoles}
            onChange={setEditedRoles}
            options={roleOptions}
            disabled={coachSeul(editedStatuts)}
            helperText={
              coachSeul(editedStatuts) ? t("roster.fields.coachHasNoRole") : t("roster.fields.rolesHelper")
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
