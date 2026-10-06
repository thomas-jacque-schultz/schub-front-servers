import type { GameRole } from "./team";

export type ComboKind =
  "JGL_TOP" | "JGL_MID" | "JGL_SUP" | "ADC_SUP" | "JGL_MID_SUP" | "COMPOSITION";

export interface ComboPickDto {
  memberId: string | null;
  memberName: string | null;
  role: GameRole;
  championId: number;
  championKey: string | null;
  championName: string | null;
  iconUrl: string | null;
}

export interface ComboDto {
  kind: ComboKind;
  picks: ComboPickDto[];
  games: number;
  wins: number;
  winRate: number;
  lowerBound: number;
  lowConfidence: boolean;
  /** Le même combo de champions, tous joueurs confondus : absent si l'échantillon n'en a pas. */
  referenceGames: number | null;
  referenceWinRate: number | null;
  /** Ce que chacun fait sur son champion sans l'autre, en moyenne. */
  expected: number | null;
}

export interface BanDto {
  championId: number;
  championKey: string | null;
  championName: string | null;
  iconUrl: string | null;
  gamesAgainst: number;
  winsAgainst: number;
  presence: number;
  winRateAgainst: number;
  impact: number;
  lowConfidence: boolean;
}

export interface LaneThreatDto {
  memberId: string;
  memberName: string | null;
  role: GameRole;
  championId: number;
  championKey: string | null;
  championName: string | null;
  iconUrl: string | null;
  games: number;
  goldDiffAt15: number;
}

export interface DraftAdviceDto {
  games: number;
  duoThreshold: number;
  trioThreshold: number;
  duos: ComboDto[];
  trios: ComboDto[];
  compositions: ComboDto[];
  avoid: ComboDto[];
  toTry: ComboDto[];
  bans: BanDto[];
  laneThreats: LaneThreatDto[];
}

export interface CompositionRecordDto {
  compositionId: string;
  games: number;
  wins: number;
  lowConfidence: boolean;
  matches: {
    matchId: string;
    startedAt: string | null;
    win: boolean;
    durationSeconds: number;
  }[];
}
