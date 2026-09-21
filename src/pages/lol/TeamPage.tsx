import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { deleteTeamApi, getTeamApi, renameTeamApi } from "../../api/teamsApi";
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
import type { TeamDto } from "../../types/team";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { DraftPanel } from "./DraftPanel";
import { RosterPanel } from "./RosterPanel";

type PanelKey = "roster" | "players" | "pool" | "draft";

/**
 * La page d'une équipe, à panneaux.
 *
 * <h2>Quatre onglets, dont deux vides — et c'est le livrable, pas un raccourci</h2>
 *
 * <p>Deux panneaux tiennent aujourd'hui sur une API qui existe : l'effectif et le préparateur de
 * draft. Les deux autres — statistiques des joueurs, pool de champions — attendent l'ingestion
 * des données Riot, en cours dans le cœur. Ils gardent leur onglet, annoncé comme à venir et
 * <strong>vide</strong> : une statistique simulée serait lue comme vraie, et il n'y aurait plus
 * moyen de savoir, le jour du branchement, laquelle des deux valeurs croire.</p>
 *
 * <p>Une nuance par rapport au plan §D.2 bis : son panneau 2 était « les parties où au moins
 * quatre des cinq ont joué, toutes files confondues ». Il dépend lui aussi des données Riot ;
 * l'effectif prend ici la place du premier onglet, parce qu'il faut bien un endroit où l'équipe
 * se compose. L'annonce du panneau « joueurs » mentionne explicitement les parties d'équipe,
 * pour que ce contenu ne disparaisse pas des intentions.</p>
 *
 * <p>Seul le panneau actif est monté : ouvrir une équipe ne va pas chercher les compositions
 * tant qu'on n'ouvre pas le préparateur.</p>
 */
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
      setError(loadError instanceof Error ? loadError.message : t("team.loadFailed"));
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
      setError(renameError instanceof Error ? renameError.message : t("team.rename.failed"));
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
      navigate("/lol", { replace: true });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : t("team.delete.failed"));
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
        <Button variant="secondary" onClick={() => navigate("/lol")}>
          {t("team.back")}
        </Button>
      </Stack>
    );
  }

  const tabs: TabItem[] = [
    { key: "roster", label: t("tabs.roster") },
    { key: "players", label: t("tabs.players"), badge: t("tabs.soonBadge") },
    { key: "pool", label: t("tabs.pool"), badge: t("tabs.soonBadge") },
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
            <Button variant="ghost" onClick={() => navigate("/lol")}>
              {t("team.back")}
            </Button>
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

      {/* Un membre voit tout et n'écrit rien : on le dit, plutôt que de laisser croire à des
          boutons perdus. C'est la règle de portée du plan §A.1, pas un incident. */}
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
        {panel === "roster" && <RosterPanel team={team} onTeamChange={setTeam} />}
        {panel === "players" && (
          <ComingSoonPanel title={t("soon.players.title")} description={t("soon.players.description")} />
        )}
        {panel === "pool" && (
          <ComingSoonPanel title={t("soon.pool.title")} description={t("soon.pool.description")} />
        )}
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
