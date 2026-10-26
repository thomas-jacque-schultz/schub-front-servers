import type { ClosenessDto } from "../../types/stats";

export interface PaireProche {
  a: string;
  b: string;
  share: number;
  early: number | null;
  late: number | null;
  games: number;
}

export interface JoueurIsole {
  nom: string;
  share: number;
  proche: string;
  procheShare: number;
}

export interface ResumeDeProximite {
  soude: PaireProche | null;
  isole: JoueurIsole | null;
  avant: number | null;
  apres: number | null;
}

const moyennePonderee = (
  paires: PaireProche[],
  part: (p: PaireProche) => number | null,
) => {
  const comptees = paires.filter((p) => part(p) !== null);
  const parties = comptees.reduce((s, p) => s + p.games, 0);
  return parties === 0
    ? null
    : comptees.reduce((s, p) => s + part(p)! * p.games, 0) / parties;
};

// Chaque paire figure deux fois dans la réponse, une fois par membre : on n'en garde qu'une.
export function resumeDeProximite(membres: ClosenessDto[]): ResumeDeProximite {
  const paires: PaireProche[] = [];
  membres.forEach((membre) =>
    membre.mates.forEach((mate) => {
      if (mate.share === null || membre.memberId > mate.memberId) return;
      paires.push({
        a: membre.displayName ?? "?",
        b: mate.displayName ?? "?",
        share: mate.share,
        early: mate.earlyShare,
        late: mate.lateShare,
        games: mate.games,
      });
    }),
  );
  const soude = paires.reduce<PaireProche | null>(
    (meilleure, p) =>
      meilleure === null || p.share > meilleure.share ? p : meilleure,
    null,
  );

  const isoles = membres
    .map((membre) => {
      const proches = membre.mates.filter((m) => m.share !== null);
      if (proches.length < 2) return null;
      const plusProche = proches.reduce(
        (x, y) => (y.share! > x.share! ? y : x),
        proches[0],
      );
      return {
        nom: membre.displayName ?? "?",
        share: proches.reduce((s, m) => s + m.share!, 0) / proches.length,
        proche: plusProche.displayName ?? "?",
        procheShare: plusProche.share!,
      };
    })
    .filter((j): j is JoueurIsole => j !== null)
    .sort((x, y) => x.share - y.share);

  return {
    soude,
    isole: isoles.length >= 3 ? isoles[0] : null,
    avant: moyennePonderee(paires, (p) => p.early),
    apres: moyennePonderee(paires, (p) => p.late),
  };
}
