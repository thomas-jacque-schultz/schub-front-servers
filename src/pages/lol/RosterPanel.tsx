import { useState } from "react";
import { useTranslation } from "react-i18next";
import { addTeamMemberApi, removeTeamMemberApi, updateTeamMemberApi } from "../../api/teamsApi";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  DataTable,
  type DataTableColumn,
  Dialog,
  SelectField,
  Stack,
  Text,
  TextField,
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

export interface RosterPanelProps {
  team: TeamDto;
  /** Les écritures rendent l'équipe entière : un seul appel suffit à redessiner l'écran. */
  onTeamChange: (team: TeamDto) => void;
}

/** La valeur qui représente « pas de poste » dans une liste déroulante, qui ne connaît que des chaînes. */
const NO_ROLE = "";

/**
 * L'effectif : qui est dans l'équipe, à quel poste, et à quel titre.
 *
 * <h2>Un seul geste d'ajout, deux issues</h2>
 *
 * <p>Le plan parlait d'un membre « lié » ou « libre » ; le cœur, lui, n'offre qu'un formulaire —
 * un Riot ID. Il relie la place tout seul au compte dont le `puuid` correspond, s'il en existe
 * un. Lié et libre ne sont donc pas deux gestes mais deux <em>résultats</em> du même geste, et
 * c'est ce qui permet de monter une équipe sans attendre que les cinq se soient connectés.
 * Proposer un sélecteur de comptes à côté aurait été une deuxième porte vers la même
 * opération — et une porte qui demande à ses joueurs d'exister d'abord.</p>
 *
 * <h2>Ce qui décide de l'affichage des boutons</h2>
 *
 * <p>{@code team.viewerCanEdit}, servi par le cœur, et rien d'autre. Aucune comparaison d'identifiants
 * ici : la seule que l'écran se permette est {@code memberId === team.viewerMemberId} pour se
 * surligner, et c'est justement la forme que le plan §A.5 bis autorise — un fait sur le lecteur,
 * pas la liste des ayants droit.</p>
 */
export function RosterPanel({ team, onTeamChange }: RosterPanelProps) {
  const { t } = useTranslation("teams");

  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [gameName, setGameName] = useState<string>("");
  const [tagLine, setTagLine] = useState<string>("");
  const [newRole, setNewRole] = useState<string>(NO_ROLE);
  const [newStatus, setNewStatus] = useState<MemberStatus>("TITULAIRE");

  const [edited, setEdited] = useState<TeamMemberDto | null>(null);
  const [editedRole, setEditedRole] = useState<string>(NO_ROLE);
  const [editedStatus, setEditedStatus] = useState<MemberStatus>("TITULAIRE");

  const [removed, setRemoved] = useState<TeamMemberDto | null>(null);

  const canEdit = team.viewerCanEdit;

  const roleOptions = [
    { value: NO_ROLE, label: t("roster.noRole") },
    ...GAME_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) })),
  ];

  const statusOptions = MEMBER_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }));

  /**
   * Un coach ne tient pas de poste — le cœur refuse le contraire en 400.
   *
   * <p>L'écran le rejoue pour ne pas *proposer* ce qui sera refusé : on retire le poste au
   * moment où le statut passe à coach, et on le dit. Découvrir la règle par un message d'erreur
   * après coup se lit comme une panne.</p>
   */
  const roleFor = (status: MemberStatus, role: string): GameRole | null =>
    status === "COACH" || role === NO_ROLE ? null : (role as GameRole);

  const onAdd = async () => {
    if (!gameName.trim() || !tagLine.trim()) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      onTeamChange(
        await addTeamMemberApi(team.id, {
          riotGameName: gameName.trim(),
          riotTagLine: tagLine.trim(),
          role: roleFor(newStatus, newRole),
          status: newStatus,
        }),
      );
      setIsAdding(false);
      setGameName("");
      setTagLine("");
      setNewRole(NO_ROLE);
      setNewStatus("TITULAIRE");
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
          role: roleFor(editedStatus, editedRole),
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
      key: "role",
      header: t("roster.columns.role"),
      render: (member) =>
        member.role ? (
          <Text>{t(`roles.${member.role}`)}</Text>
        ) : (
          <Text tone="disabled">{t("roster.noRole")}</Text>
        ),
    },
    {
      key: "status",
      header: t("roster.columns.status"),
      render: (member) => <Text tone="secondary">{t(`status.${member.status}`)}</Text>,
    },
    {
      key: "account",
      header: t("roster.columns.account"),
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
      width: 200,
      render: (member) => (
        <Stack direction="row" spacing={1} justify="end">
          <Button
            size="small"
            variant="ghost"
            onClick={() => {
              setEdited(member);
              setEditedRole(member.role ?? NO_ROLE);
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
        />
      </Card>

      <Dialog
        open={isAdding}
        title={t("roster.add.title")}
        description={t("roster.add.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("roster.add.confirm")}
        confirmDisabled={!gameName.trim() || !tagLine.trim()}
        confirmLoading={isSaving}
        onClose={() => setIsAdding(false)}
        onConfirm={() => void onAdd()}
      >
        <Stack spacing={2}>
          <TextField
            label={t("roster.add.gameName")}
            value={gameName}
            onChange={setGameName}
            helperText={t("roster.add.gameNameHelper")}
            required
            autoFocus
          />
          <TextField
            label={t("roster.add.tagLine")}
            value={tagLine}
            onChange={setTagLine}
            helperText={t("roster.add.tagLineHelper")}
            required
          />
          <SelectField
            label={t("roster.fields.status")}
            value={newStatus}
            onChange={(value) => setNewStatus(value as MemberStatus)}
            options={statusOptions}
          />
          <SelectField
            label={t("roster.fields.role")}
            value={newStatus === "COACH" ? NO_ROLE : newRole}
            onChange={setNewRole}
            options={roleOptions}
            disabled={newStatus === "COACH"}
            helperText={
              newStatus === "COACH" ? t("roster.fields.coachHasNoRole") : t("roster.fields.roleHelper")
            }
          />
        </Stack>
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
          <SelectField
            label={t("roster.fields.role")}
            value={editedStatus === "COACH" ? NO_ROLE : editedRole}
            onChange={setEditedRole}
            options={roleOptions}
            disabled={editedStatus === "COACH"}
            helperText={
              editedStatus === "COACH" ? t("roster.fields.coachHasNoRole") : t("roster.fields.roleHelper")
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
