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
}

export interface CompositionDto {
  id: string;
  teamId: string;
  name: string;
  slots: CompositionSlotDto[];
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
}

export interface UpdateMemberRequest {
  roles: GameRole[];
  status: MemberStatus;
}

export interface CompositionSlotRequest {
  role: GameRole;
  championId: string;
  memberId: string | null;
}

export interface CompositionRequest {
  name: string;
  slots: CompositionSlotRequest[];
  patch: string | null;
  notes: string | null;
}

export const riotIdOf = (member: TeamMemberDto): string | null =>
  member.riotGameName && member.riotTagLine
    ? `${member.riotGameName}#${member.riotTagLine}`
    : null;

export const playableMembers = (members: TeamMemberDto[]): TeamMemberDto[] =>
  members.filter((member) => member.status !== "COACH");
