import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { deleteTeamApi, getTeamApi, renameTeamApi } from "../api/teamsApi";
import {
  Alert,
  Button,
  Dialog,
  PageHeader,
  ProgressBar,
  Stack,
  type TabItem,
  Tabs,
  Text,
  TextField,
} from "../../design-system";
import { useLocalizedNavigate } from "../../i18n/navigation";
import type { TeamDto } from "../types/team";
import { PoolPanel } from "./pool/PoolPanel";
import { StrategyPanel } from "./stats/StrategyPanel";
import { PlayersPanel } from "./stats/PlayersPanel";
import { TeamGamesPanel } from "./stats/TeamGamesPanel";
import { DraftPanel } from "./DraftPanel";
import { StatsRefreshButton } from "./stats/StatsRefreshButton";
import { RosterPanel } from "./RosterPanel";

type PanelKey = "roster" | "players" | "team" | "opposition" | "pool" | "draft";

function TeamPage() {
  const { t } = useTranslation("teams");
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useLocalizedNavigate();

  const [team, setTeam] = useState<TeamDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [panel, setPanel] = useState<PanelKey>("roster");

  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setTeam(await getTeamApi(id));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("team.loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRename = async () => {
    if (!team || !newName.trim()) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      setTeam(await renameTeamApi(team.id, newName.trim()));
      setIsRenaming(false);
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : t("team.rename.failed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!team) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await deleteTeamApi(team.id);
      navigate("/lol/teams", { replace: true });
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : t("team.delete.failed"),
      );
      setIsDeleting(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <ProgressBar label={t("list.title")} />
      </Stack>
    );
  }

  if (!team) {
    return (
      <Stack spacing={3}>
        <Alert severity="error">{error || t("team.loadFailed")}</Alert>
        <Button variant="secondary" onClick={() => navigate("/lol/teams")}>
          {t("team.back")}
        </Button>
      </Stack>
    );
  }

  const tabs: TabItem[] = [
    { key: "roster", label: t("tabs.roster") },
    { key: "players", label: t("tabs.players") },
    { key: "team", label: t("tabs.team") },
    { key: "opposition", label: t("opposition.tab", { ns: "stats" }) },
    { key: "pool", label: t("tabs.pool") },
    { key: "draft", label: t("tabs.draft") },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={team.name}
        subtitle={t("team.membersSummary", { count: team.memberCount })}
        actions={
          <Stack direction="row" spacing={1} wrap>
            <Button variant="ghost" onClick={() => navigate("/lol/teams")}>
              {t("team.back")}
            </Button>
            <StatsRefreshButton teamId={team.id} />
            {team.viewerCanEdit && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setNewName(team.name);
                    setIsRenaming(true);
                  }}
                >
                  {t("team.rename.action")}
                </Button>
                <Button variant="danger" onClick={() => setIsDeleting(true)}>
                  {t("team.delete.action")}
                </Button>
              </>
            )}
          </Stack>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      {!team.viewerCanEdit && (
        <Text variant="caption" tone="secondary">
          {t("team.readOnly")}
        </Text>
      )}

      <Tabs
        items={tabs}
        value={panel}
        onChange={(key) => setPanel(key as PanelKey)}
        ariaLabel={t("tabs.ariaLabel")}
      >
        {panel === "roster" && (
          <RosterPanel team={team} onTeamChange={setTeam} />
        )}
        {panel === "players" && <PlayersPanel teamId={team.id} />}
        {panel === "team" && (
          <TeamGamesPanel
            teamId={team.id}
            avatars={Object.fromEntries(team.members.map((member) => [member.memberId, member.avatarUrl]))}
          />
        )}
        {panel === "opposition" && <StrategyPanel teamId={team.id} />}
        {panel === "pool" && <PoolPanel teamId={team.id} />}
        {panel === "draft" && <DraftPanel team={team} />}
      </Tabs>

      <Dialog
        open={isRenaming}
        title={t("team.rename.title")}
        description={t("team.rename.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("team.rename.confirm")}
        confirmDisabled={!newName.trim()}
        confirmLoading={isSaving}
        onClose={() => setIsRenaming(false)}
        onConfirm={() => void onRename()}
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

      <Dialog
        open={isDeleting}
        title={t("team.delete.title", { name: team.name })}
        description={t("team.delete.description")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("team.delete.confirm")}
        confirmLoading={isSaving}
        destructive
        onClose={() => setIsDeleting(false)}
        onConfirm={() => void onDelete()}
      />
    </Stack>
  );
}

export default TeamPage;
