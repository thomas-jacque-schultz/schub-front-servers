import { describe, expect, it } from "vitest";
import type { RolesDto } from "../../types/stats";
import { compagnonDuSupport, paireDe, prochesDu } from "./soutiens";

const ligne = (position: string, lateAlone: number | null) => ({
  position,
  earlyAlone: null,
  lateAlone,
  objectivePresence: null,
  jungleFightPresence: null,
});

const roles = (
  paires: [string, string, number | null][],
  seulSupport: number | null,
): RolesDto => ({
  games: 6,
  objectives: 12,
  jungleFights: 4,
  roles: [ligne("UTILITY", seulSupport), ligne("BOTTOM", 0.4)],
  pairs: paires.map(([position, matePosition, lateShare]) => ({
    position,
    matePosition,
    earlyShare: null,
    lateShare,
  })),
  takes: {
    crowded: 0,
    takenCrowded: 0,
    sparse: 0,
    takenSparse: 0,
    withSupport: 0,
    takenWithSupport: 0,
    withoutSupport: 0,
    takenWithoutSupport: 0,
  },
  fights: { helped: 0, wonHelped: 0, alone: 0, wonAlone: 0 },
  holders: [],
});

describe("soutiens", () => {
  it("trouve une paire dans les deux sens", () => {
    const r = roles([["JUNGLE", "UTILITY", 0.3]], null);
    expect(paireDe(r, "UTILITY", "JUNGLE")?.lateShare).toBe(0.3);
    expect(paireDe(r, "UTILITY", "TOP")).toBeNull();
  });

  it("range les coéquipiers du plus proche au plus lointain après 15 min", () => {
    const r = roles(
      [
        ["BOTTOM", "UTILITY", 0.2],
        ["JUNGLE", "UTILITY", 0.45],
      ],
      0.1,
    );
    expect(prochesDu(r, "UTILITY").map((p) => p.poste)).toEqual([
      "JUNGLE",
      "BOTTOM",
      "TOP",
      "MIDDLE",
    ]);
  });

  it("dit le support seul quand il l'est plus souvent qu'il n'est près de quiconque", () => {
    expect(compagnonDuSupport(roles([["BOTTOM", "UTILITY", 0.5]], 0.2))).toBe(
      "BOTTOM",
    );
    expect(compagnonDuSupport(roles([["BOTTOM", "UTILITY", 0.3]], 0.4))).toBe(
      "alone",
    );
    expect(compagnonDuSupport(roles([], null))).toBeNull();
  });
});
