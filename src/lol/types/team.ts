export const GAME_ROLES = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;

export type GameRole = (typeof GAME_ROLES)[number];

export const MEMBER_STATUSES = ["TITULAIRE", "REMPLACANT", "COACH"] as const;

export type MemberStatus = (typeof MEMBER_STATUSES)[number];

interface ViewerFacts {
  viewerMemberId: string | null;
  viewerCanEdit: boolean;
  viewerCanEditCompositions: boolean;
}

export interface TeamSummaryDto extends ViewerFacts {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberDto {
  memberId: string;
  displayName: string;
  avatarUrl: string | null;
  riotGameName: string | null;
  riotTagLine: string | null;
  roles: GameRole[];
  status: MemberStatus;
  /** Cumulable avec titulaire ou remplaçant ; vrai aussi pour le statut COACH. */
  coach: boolean;
  linked: boolean;
  captain: boolean;
}

export interface TeamDto extends ViewerFacts {
  id: string;
  name: string;
  memberCount: number;
  members: TeamMemberDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CompositionSlotDto {
  role: GameRole;
  // Clé Data Dragon (Ahri, MonkeyKing…), pas un nom affiché.
  championId: string | null;
  memberId: string | null;
  playerDisplayName: string | null;
  alternatives: string[];
}

export interface CompositionDto {
  id: string;
  teamId: string;
  name: string;
  slots: CompositionSlotDto[];
  bans: string[];
  patch: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  viewerCanEdit: boolean;
}

export interface TeamNameRequest {
  name: string;
}

export interface AddMemberRequest {
  riotGameName: string;
  riotTagLine: string;
  riotPuuid?: string | null;
  roles: GameRole[];
  status: MemberStatus;
  coach: boolean;
}

export interface UpdateMemberRequest {
  roles: GameRole[];
  status: MemberStatus;
  coach: boolean;
}

export interface CompositionSlotRequest {
  role: GameRole;
  championId: string;
  memberId: string | null;
  alternatives: string[];
}

export interface CompositionRequest {
  name: string;
  slots: CompositionSlotRequest[];
  bans: string[];
  patch: string | null;
  notes: string | null;
}

export const riotIdOf = (member: TeamMemberDto): string | null =>
  member.riotGameName && member.riotTagLine
    ? `${member.riotGameName}#${member.riotTagLine}`
    : null;

export const playableMembers = (members: TeamMemberDto[]): TeamMemberDto[] =>
  members.filter((member) => member.status !== "COACH");

export const statutsOf = (member: Pick<TeamMemberDto, "status" | "coach">): MemberStatus[] => [
  ...(member.status === "COACH" ? [] : [member.status]),
  ...(member.coach || member.status === "COACH" ? (["COACH"] as MemberStatus[]) : []),
];

/** Titulaire et remplaçant s'excluent : le dernier coché l'emporte. */
export const choisitStatuts = (avant: MemberStatus[], apres: MemberStatus[]): MemberStatus[] => {
  const ajoute = apres.find((statut) => !avant.includes(statut));
  if (ajoute === "TITULAIRE") {
    return apres.filter((statut) => statut !== "REMPLACANT");
  }
  if (ajoute === "REMPLACANT") {
    return apres.filter((statut) => statut !== "TITULAIRE");
  }
  return apres;
};

export const versRequete = (statuts: MemberStatus[]): { status: MemberStatus; coach: boolean } => ({
  status: statuts.includes("TITULAIRE")
    ? "TITULAIRE"
    : statuts.includes("REMPLACANT")
      ? "REMPLACANT"
      : "COACH",
  coach: statuts.includes("COACH"),
});
