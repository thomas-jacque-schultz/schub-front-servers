import type { PlayerStatsDto, StatLineDto } from "../../types/stats";

export const CHAMPIONS_EN_COLONNE = 3;

export const championsAffiches = (
  champions: StatLineDto[],
  choisis: string[],
  parDefaut: number,
) =>
  choisis.length > 0
    ? champions.filter((line) => choisis.includes(line.key))
    : champions.slice(0, parDefaut);

export const championsEnColonne = (
  player: PlayerStatsDto,
  choisis: string[],
): StatLineDto[] =>
  championsAffiches(player.champions, choisis, CHAMPIONS_EN_COLONNE);
