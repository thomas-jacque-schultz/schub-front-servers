import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  Expandable,
  Frame,
  Histogram,
  ProgressBar,
  StatGrid,
  Stack,
  Text,
  messageOf,
  useLocaleFormat,
  useRequest,
} from "../../../common";
import { getTeamGameDetailApi } from "../../api/statsApi";
import { getTeamSessionGamesApi, getTeamSessionsApi } from "../../api/teamsApi";
import type { TeamDto, TeamSessionDto } from "../../types/team";
import { GameDetail } from "../stats/GameDetail";
import { GameHistoryList } from "../stats/GameHistoryList";
import { TrainingCard } from "./TrainingCard";

const JOURS = 180;
const HISTOGRAMME_MAX = 10;
const LIGNES_PAR_PAGE = 10;

const partPourCent = (s: TeamSessionDto) =>
  s.games === 0 ? 0 : Math.round((100 * s.wins) / s.games);

/** Les sessions de l'équipe (Schub#173) : la tendance, puis chaque soirée, qui s'ouvre sur ses parties. */
export function SessionsPanel({
  team,
  onTeamChange,
}: {
  team: TeamDto;
  onTeamChange: (team: TeamDto) => void;
}) {
  const { t } = useTranslation("teams");
  const { data, error, isLoading } = useRequest(`sessions/${team.id}`, () =>
    getTeamSessionsApi(team.id, JOURS),
  );
  const sessions = data ?? [];
  const jouees = sessions.filter((s) => !s.missed);

  return (
    <Stack spacing={2}>
      {error !== null && (
        <Alert severity="error">{messageOf(error, t("sessions.failed"))}</Alert>
      )}
      {isLoading && !data && <ProgressBar label={t("sessions.loading")} />}
      {data && jouees.length === 0 && (
        <EmptyState
          title={t("sessions.emptyTitle")}
          description={t("sessions.emptyBody")}
        />
      )}
      {jouees.length > 0 && <Tendance sessions={sessions} />}
      {jouees.length > 0 && <Liste team={team} sessions={sessions} />}
      <TrainingCard team={team} onTeamChange={onTeamChange} />
    </Stack>
  );
}

function Tendance({ sessions }: { sessions: TeamSessionDto[] }) {
  const { t } = useTranslation("teams");
  const { formatDayMonth } = useLocaleFormat();
  const jouees = sessions.filter((s) => !s.missed);
  const prevues = sessions.filter((s) => s.planned);
  const parties = jouees.reduce((total, s) => total + s.games, 0);
  const victoires = jouees.reduce((total, s) => total + s.wins, 0);
  const dernieres = jouees.slice(0, HISTOGRAMME_MAX).reverse();

  return (
    <Card
      title={t("sessions.trend")}
      description={t("sessions.window", { days: JOURS })}
    >
      <Stack spacing={2}>
        <StatGrid
          divided
          items={[
            {
              key: "sessions",
              label: t("sessions.played"),
              value: String(jouees.length),
            },
            {
              key: "bilan",
              label: t("sessions.record"),
              value: t("sessions.recordValue", {
                wins: victoires,
                losses: parties - victoires,
              }),
              hint: t("sessions.games", { count: parties }),
            },
            {
              key: "tenues",
              label: t("sessions.kept"),
              value:
                prevues.length === 0
                  ? "—"
                  : `${prevues.filter((s) => !s.missed).length}/${prevues.length}`,
            },
          ]}
        />
        {dernieres.length >= 2 && (
          <Stack spacing={0.5}>
            <Text variant="overline">
              {t("sessions.histogram", { count: dernieres.length })}
            </Text>
            <Histogram
              ariaLabel={t("sessions.histogram", { count: dernieres.length })}
              max={100}
              highlight={dernieres.length - 1}
              labelEvery={1}
              bars={dernieres.map((s) => ({
                label: formatDayMonth(new Date(s.startedAt)),
                value: partPourCent(s),
                tooltip: t("sessions.barTooltip", {
                  date: formatDayMonth(new Date(s.startedAt)),
                  percent: partPourCent(s),
                  wins: s.wins,
                  losses: s.games - s.wins,
                }),
              }))}
            />
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

function Liste({
  team,
  sessions,
}: {
  team: TeamDto;
  sessions: TeamSessionDto[];
}) {
  const { t } = useTranslation("teams");
  const { formatDate } = useLocaleFormat();
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [affichees, setAffichees] = useState(LIGNES_PAR_PAGE);

  return (
    <Card title={t("sessions.list")} description={t("sessions.listHelper")}>
      <Stack spacing={1}>
        {sessions.slice(0, affichees).map((s) =>
          s.missed ? (
            <Frame key={s.id}>
              <Stack direction="row" spacing={1.5} align="center" wrap>
                <Text tone="secondary">
                  {formatDate(new Date(s.startedAt))}
                </Text>
                <Chip
                  label={t("sessions.kindMissed")}
                  tone="warning"
                  variant="outline"
                  size="small"
                />
              </Stack>
            </Frame>
          ) : (
            <Expandable
              key={s.id}
              open={ouverte === s.id}
              onToggle={(ouvre) => setOuverte(ouvre ? s.id : null)}
              summary={<Ligne team={team} session={s} />}
            >
              <Parties team={team} session={s} />
            </Expandable>
          ),
        )}
        {sessions.length > affichees && (
          <div>
            <Button
              variant="ghost"
              onClick={() => setAffichees((n) => n + LIGNES_PAR_PAGE)}
            >
              {t("sessions.more")}
            </Button>
          </div>
        )}
      </Stack>
    </Card>
  );
}

function Ligne({ team, session }: { team: TeamDto; session: TeamSessionDto }) {
  const { t } = useTranslation("teams");
  const { formatDate, formatHour } = useLocaleFormat();
  const presents = team.members.filter((m) =>
    session.memberIds.includes(m.memberId),
  );
  return (
    <Stack
      direction="row"
      spacing={1.5}
      align="center"
      justify="between"
      wrap
      fullWidth
    >
      <Stack direction="row" spacing={1.5} align="center" wrap>
        <Text variant="subtitle">
          {formatDate(new Date(session.startedAt))}
        </Text>
        <Chip
          label={t(
            session.planned ? "sessions.kindPlanned" : "sessions.kindFree",
          )}
          tone={session.planned ? "primary" : "neutral"}
          variant="outline"
          size="small"
        />
        <Text variant="caption" tone="secondary">
          {t("sessions.hours", {
            start: formatHour(new Date(session.startedAt)),
            end: formatHour(new Date(session.endedAt)),
          })}
        </Text>
      </Stack>
      <Stack direction="row" spacing={1.5} align="center">
        <Stack direction="row" spacing={0.25}>
          {presents.map((m) => (
            <Avatar
              key={m.memberId}
              src={m.avatarUrl}
              name={m.displayName}
              size="small"
            />
          ))}
        </Stack>
        <Text mono>
          {t("sessions.recordValue", {
            wins: session.wins,
            losses: session.games - session.wins,
          })}
        </Text>
        <Text mono tone="secondary">
          {partPourCent(session)}&nbsp;%
        </Text>
      </Stack>
    </Stack>
  );
}

function Parties({
  team,
  session,
}: {
  team: TeamDto;
  session: TeamSessionDto;
}) {
  const { t } = useTranslation("teams");
  const { data, error, isLoading } = useRequest(`session/${session.id}`, () =>
    getTeamSessionGamesApi(team.id, session.id),
  );
  const avatars = Object.fromEntries(
    team.members.map((m) => [m.memberId, m.avatarUrl]),
  );

  if (error !== null) {
    return (
      <Alert severity="warning">
        {messageOf(error, t("sessions.gamesFailed"))}
      </Alert>
    );
  }
  if (isLoading || !data) {
    return <ProgressBar label={t("sessions.loading")} />;
  }
  return (
    <GameHistoryList
      games={data}
      avatars={avatars}
      renderDetail={(game) => (
        <GameDetail
          requestKey={`${team.id}/${game.matchId}`}
          load={() => getTeamGameDetailApi(team.id, game.matchId, "")}
          avatars={avatars}
        />
      )}
    />
  );
}
