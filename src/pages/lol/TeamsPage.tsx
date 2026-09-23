import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { claimTeamsApi, createTeamApi, getMyTeamsApi } from "../../api/teamsApi";
import {
  Alert,
  Button,
  Card,
  Chip,
  DataTable,
  type DataTableColumn,
  Dialog,
  PageHeader,
  ProgressBar,
  Stack,
  Text,
  TextField,
  Toast,
} from "../../design-system";
import { useLocaleFormat } from "../../i18n/format";
import { useLocalizedNavigate } from "../../i18n/navigation";
import { useAuthStore } from "../../stores/authStore";
import type { TeamSummaryDto } from "../../types/team";

function TeamsPage() {
  const { t } = useTranslation("teams");
  const { formatDateTime } = useLocaleFormat();
  const { can } = useAuthStore();
  const navigate = useLocalizedNavigate();

  const [teams, setTeams] = useState<TeamSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const canCreate = can("TEAM_CREATE");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setTeams(await getMyTeamsApi());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    if (!newName.trim()) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const created = await createTeamApi(newName.trim());
      setIsCreating(false);
      setNewName("");
      navigate(`/lol/teams/${created.id}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t("create.failed"));
    } finally {
      setIsSaving(false);
    }
  };

  const onClaim = async () => {
    setIsClaiming(true);
    setError("");
    try {
      const claimed = await claimTeamsApi();
      setToast(claimed.length === 0 ? t("list.claimNone") : t("list.claimDone", { count: claimed.length }));
      if (claimed.length > 0) {
        await load();
      }
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : t("errors.loadFailed"));
    } finally {
      setIsClaiming(false);
    }
  };

  const columns: Array<DataTableColumn<TeamSummaryDto>> = [
    {
      key: "name",
      header: t("list.nameHeader"),
      render: (team) => (
        <Stack spacing={0.5}>
          <Text>{team.name}</Text>
          <Stack direction="row" spacing={1} wrap>
            {team.viewerCanEdit && <Chip label={t("list.canEdit")} tone="primary" variant="outline" />}
            {!team.viewerCanEdit && team.viewerMemberId && (
              <Chip label={t("list.isMember")} variant="outline" />
            )}
          </Stack>
        </Stack>
      ),
    },
    {
      key: "members",
      header: t("list.membersHeader"),
      render: (team) => <Text tone="secondary">{t("list.memberCount", { count: team.memberCount })}</Text>,
    },
    {
      key: "updated",
      header: t("list.updatedHeader"),
      render: (team) => (
        <Text variant="caption" tone="secondary">
          {formatDateTime(new Date(team.updatedAt))}
        </Text>
      ),
    },
    {
      key: "actions",
      header: t("roster.columns.actions"),
      align: "right",
      width: 160,
      render: (team) => (
        <Button size="small" variant="secondary" onClick={() => navigate(`/lol/teams/${team.id}`)}>
          {t("list.open")}
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("list.title")}
        subtitle={t("list.subtitle")}
        actions={
          <Stack direction="row" spacing={1} wrap>
            <Button variant="ghost" onClick={() => void onClaim()} loading={isClaiming}>
              {t("list.claim")}
            </Button>
            {canCreate && <Button onClick={() => setIsCreating(true)}>{t("create.action")}</Button>}
          </Stack>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}
      {isLoading && <ProgressBar label={t("list.title")} />}

      {!isLoading && (
        <Card disablePadding>
          <DataTable
            columns={columns}
            rows={teams}
            rowKey={(team) => team.id}
            caption={t("list.caption")}
            emptyTitle={t("list.emptyTitle")}
            emptyDescription={t("list.emptyDescription")}
          />
        </Card>
      )}

      <Text variant="caption" tone="secondary">
        {t("list.claimHelper")}
      </Text>

      <Dialog
        open={isCreating}
        title={t("create.title")}
        description={t("create.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("create.confirm")}
        confirmDisabled={!newName.trim()}
        confirmLoading={isSaving}
        onClose={() => setIsCreating(false)}
        onConfirm={() => void onCreate()}
      >
        <TextField
          label={t("create.field")}
          value={newName}
          onChange={setNewName}
          helperText={t("create.helper")}
          required
          autoFocus
        />
      </Dialog>

      <Toast open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </Stack>
  );
}

export default TeamsPage;
