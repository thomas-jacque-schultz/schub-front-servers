import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  IconButton,
  SegmentedControl,
  SelectField,
  Stack,
  Text,
  TextField,
  messageOf,
  useLocaleFormat,
  useRequest,
} from "../../../common";
import { getTeamSessionsApi, setTrainingSlotsApi } from "../../api/teamsApi";
import type {
  TeamDto,
  TeamSessionDto,
  TrainingSlotDto,
  WeekDay,
} from "../../types/team";

const JOURS: WeekDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const heure = (valeur: string) => valeur.slice(0, 5);

/** Soirées d'entraînement (Schub#102) et sessions détectées par l'observateur (Schub#103). */
export function TrainingCard({
  team,
  onTeamChange,
}: {
  team: TeamDto;
  onTeamChange: (team: TeamDto) => void;
}) {
  const { t } = useTranslation("teams");
  const { formatDate } = useLocaleFormat();
  const { data: sessions } = useRequest(`sessions/${team.id}`, () =>
    getTeamSessionsApi(team.id),
  );
  const [genre, setGenre] = useState<"recurring" | "once">("recurring");
  const [jour, setJour] = useState<WeekDay>("THURSDAY");
  const [date, setDate] = useState<string>("");
  const [debut, setDebut] = useState<string>("21:00");
  const [fin, setFin] = useState<string>("23:00");
  const [erreur, setErreur] = useState<string>("");
  const creneaux = team.trainingSlots ?? [];

  const enregistre = async (liste: TrainingSlotDto[]) => {
    setErreur("");
    try {
      onTeamChange(await setTrainingSlotsApi(team.id, liste));
    } catch (e) {
      setErreur(messageOf(e, t("training.saveFailed")));
    }
  };

  const libelle = (slot: TrainingSlotDto) =>
    t(slot.day ? "training.recurring" : "training.once", {
      day: slot.day ? t(`training.days.${slot.day}`) : "",
      date: slot.date ? formatDate(new Date(slot.date)) : "",
      start: heure(slot.start),
      end: heure(slot.end),
    });

  const session = (s: TeamSessionDto) =>
    s.missed
      ? t("training.missed", { date: formatDate(new Date(s.startedAt)) })
      : t(s.planned ? "training.sessionPlanned" : "training.sessionFree", {
          date: formatDate(new Date(s.startedAt)),
          count: s.games,
          wins: s.wins,
          losses: s.games - s.wins,
        });

  return (
    <Card title={t("training.title")}>
      <Stack spacing={2}>
        {erreur && <Alert severity="error">{erreur}</Alert>}
        {creneaux.length === 0 ? (
          <Text tone="secondary">{t("training.none")}</Text>
        ) : (
          <Stack spacing={0.5}>
            {creneaux.map((slot) => (
              <Stack
                key={slot.id ?? libelle(slot)}
                direction="row"
                spacing={1}
                align="center"
              >
                <Text>{libelle(slot)}</Text>
                {team.viewerCanManage && (
                  <IconButton
                    icon="delete"
                    label={t("training.remove")}
                    onClick={() =>
                      void enregistre(creneaux.filter((c) => c.id !== slot.id))
                    }
                  />
                )}
              </Stack>
            ))}
          </Stack>
        )}
        {team.viewerCanManage && (
          <Stack direction="responsive" spacing={1.5} align="center">
            <SegmentedControl
              value={genre}
              onChange={(value) => setGenre(value as "recurring" | "once")}
              options={[
                { value: "recurring", label: t("training.kindRecurring") },
                { value: "once", label: t("training.kindOnce") },
              ]}
              label={t("training.kind")}
            />
            {genre === "recurring" ? (
              <SelectField
                label={t("training.day")}
                value={jour}
                onChange={(value) => setJour(value as WeekDay)}
                options={JOURS.map((j) => ({
                  value: j,
                  label: t(`training.days.${j}`),
                }))}
              />
            ) : (
              <TextField
                label={t("training.date")}
                type="date"
                value={date}
                onChange={setDate}
              />
            )}
            <TextField
              label={t("training.start")}
              type="time"
              value={debut}
              onChange={setDebut}
            />
            <TextField
              label={t("training.end")}
              type="time"
              value={fin}
              onChange={setFin}
            />
            <Button
              disabled={
                !debut || !fin || debut === fin || (genre === "once" && !date)
              }
              onClick={() =>
                void enregistre([
                  ...creneaux,
                  {
                    day: genre === "recurring" ? jour : null,
                    date: genre === "once" ? date : null,
                    start: debut,
                    end: fin,
                  },
                ])
              }
            >
              {t("training.add")}
            </Button>
          </Stack>
        )}
        <Text variant="caption" tone="secondary">
          {t("training.helper")}
        </Text>
        {sessions && sessions.length > 0 && (
          <Stack spacing={0.5}>
            <Text variant="overline">{t("training.sessions")}</Text>
            {sessions.slice(0, 10).map((s) => (
              <Text key={s.id} tone={s.missed ? "secondary" : "default"}>
                {session(s)}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
