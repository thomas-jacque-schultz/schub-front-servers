import { describe, expect, it } from "vitest";
import type { ClosenessDto } from "../../types/stats";
import { resumeDeProximite } from "./proximite";

const mate = (
  memberId: string,
  share: number | null,
  games = 10,
  early = share,
  late = share,
) => ({
  memberId,
  displayName: memberId.toUpperCase(),
  games,
  share,
  earlyShare: share === null ? null : early,
  lateShare: share === null ? null : late,
});

const equipe: ClosenessDto[] = [
  {
    memberId: "a",
    displayName: "A",
    mates: [mate("b", 0.4, 10, 0.3, 0.5), mate("c", 0.1), mate("d", null, 2)],
  },
  {
    memberId: "b",
    displayName: "B",
    mates: [mate("a", 0.4, 10, 0.3, 0.5), mate("c", 0.2, 30, 0.1, 0.3)],
  },
  {
    memberId: "c",
    displayName: "C",
    mates: [mate("b", 0.2, 30, 0.1, 0.3), mate("a", 0.1)],
  },
  { memberId: "d", displayName: "D", mates: [mate("a", null, 2)] },
];

describe("resumeDeProximite", () => {
  it("garde le duo le plus soudé, une seule fois", () => {
    expect(resumeDeProximite(equipe).soude).toMatchObject({
      a: "A",
      b: "B",
      share: 0.4,
      games: 10,
    });
  });

  it("désigne le joueur le plus à l'écart et son coéquipier le plus proche", () => {
    const isole = resumeDeProximite(equipe).isole;
    expect(isole).toMatchObject({ nom: "C", proche: "B", procheShare: 0.2 });
    expect(isole!.share).toBeCloseTo(0.15);
  });

  it("pondère avant et après 15 minutes par le nombre de parties", () => {
    const { avant, apres } = resumeDeProximite(equipe);
    expect(avant).toBeCloseTo((0.3 * 10 + 0.1 * 10 + 0.1 * 30) / 50);
    expect(apres).toBeCloseTo((0.5 * 10 + 0.1 * 10 + 0.3 * 30) / 50);
  });

  it("ne désigne personne à l'écart à moins de trois joueurs comparables", () => {
    expect(resumeDeProximite(equipe.slice(0, 2)).isole).toBeNull();
  });

  it("rend un résumé vide sans paire assez jouée", () => {
    expect(resumeDeProximite([equipe[3]])).toEqual({
      soude: null,
      isole: null,
      avant: null,
      apres: null,
    });
  });
});
