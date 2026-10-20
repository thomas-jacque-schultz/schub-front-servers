import type { Schemas } from "../../common";

export const GAME_ROLES = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;

export type GameRole = (typeof GAME_ROLES)[number];

export const MEMBER_STATUSES = ["TITULAIRE", "REMPLACANT", "COACH"] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export type TeamSummaryDto = Schemas["TeamSummaryDto"];

export type TeamMemberDto = Schemas["TeamMemberDto"];

export type TeamDto = Schemas["TeamDto"];

export type CompositionSlotDto = Schemas["CompositionSlotDto"];

export type CompositionDto = Schemas["CompositionDto"];

export type TeamNameRequest = Schemas["TeamNameRequest"];

export type AddMemberRequest = Schemas["AddMemberRequest"];

export type UpdateMemberRequest = Schemas["UpdateMemberRequest"];

export type CompositionSlotRequest = Schemas["CompositionSlotRequest"];

export type CompositionRequest = Schemas["CompositionRequest"];

export const riotIdOf = (member: TeamMemberDto): string | null =>
  member.riotGameName && member.riotTagLine
    ? `${member.riotGameName}#${member.riotTagLine}`
    : null;

export const playableMembers = (members: TeamMemberDto[]): TeamMemberDto[] =>
  members.filter((member) => member.status !== "COACH");

export const statutsOf = (
  member: Pick<TeamMemberDto, "status" | "coach">,
): MemberStatus[] => [
  ...(member.status === "COACH" ? [] : [member.status]),
  ...(member.coach || member.status === "COACH"
    ? (["COACH"] as MemberStatus[])
    : []),
];

/** Titulaire et remplaçant s'excluent : le dernier coché l'emporte. */
export const choisitStatuts = (
  avant: MemberStatus[],
  apres: MemberStatus[],
): MemberStatus[] => {
  const ajoute = apres.find((statut) => !avant.includes(statut));
  if (ajoute === "TITULAIRE") {
    return apres.filter((statut) => statut !== "REMPLACANT");
  }
  if (ajoute === "REMPLACANT") {
    return apres.filter((statut) => statut !== "TITULAIRE");
  }
  return apres;
};

export const versRequete = (
  statuts: MemberStatus[],
): { status: MemberStatus; coach: boolean } => ({
  status: statuts.includes("TITULAIRE")
    ? "TITULAIRE"
    : statuts.includes("REMPLACANT")
      ? "REMPLACANT"
      : "COACH",
  coach: statuts.includes("COACH"),
});

export type PublicTeamDto = Schemas["PublicTeamDto"];

export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/** Un créneau d'entraînement (Schub#102), à l'heure de Paris : récurrent (day) ou ponctuel (date). */
export type TrainingSlotDto = Schemas["TrainingSlotDto"];

export type TeamSessionDto = Schemas["TeamSessionDto"];
