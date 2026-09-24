import type { StatLineDto } from "../../types/stats";

export const championsAffiches = (champions: StatLineDto[], choisis: string[], parDefaut: number) =>
  choisis.length > 0
    ? champions.filter((line) => choisis.includes(line.key))
    : champions.slice(0, parDefaut);
