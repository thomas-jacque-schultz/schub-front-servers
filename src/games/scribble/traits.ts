// Un trait est envoyé par morceaux (toutes les ~50 ms), en coordonnées relatives au tableau (de 0 à 1) :
// les écrans de tailles différentes voient le même dessin. Épaisseur relative à la largeur du tableau.
export interface Morceau {
  k: "t";
  id: string;
  c: string;
  w: number;
  p: number[];
}

interface Trait {
  couleur: string;
  epaisseur: number;
  points: number[];
}

export const RATIO = 4 / 3;

// La gomme est un trait comme un autre : rejouée dans l'ordre, elle efface ce qui la précède.
export const GOMME = "gomme";

export const arrondi = (valeur: number): number =>
  Math.round(Math.min(1, Math.max(0, valeur)) * 10_000) / 10_000;

export const estMorceau = (data: unknown): data is Morceau => {
  const m = data as Partial<Morceau> | null;
  return (
    m?.k === "t" &&
    typeof m.id === "string" &&
    typeof m.c === "string" &&
    typeof m.w === "number" &&
    Array.isArray(m.p) &&
    m.p.length % 2 === 0 &&
    m.p.every((v) => typeof v === "number")
  );
};

export class Tableau {
  private readonly traits = new Map<string, Trait>();

  // Les points nouveaux d'un trait, précédés de son dernier point déjà connu : de quoi tracer la suite seule.
  ajoute(morceau: Morceau): number[] {
    const trait = this.traits.get(morceau.id) ?? {
      couleur: morceau.c,
      epaisseur: morceau.w,
      points: [],
    };
    const avant = trait.points.slice(-2);
    trait.points.push(...morceau.p);
    this.traits.set(morceau.id, trait);
    return [...avant, ...morceau.p];
  }

  vide() {
    this.traits.clear();
  }

  dessine(ctx: CanvasRenderingContext2D, largeur: number, hauteur: number) {
    ctx.clearRect(0, 0, largeur, hauteur);
    for (const trait of this.traits.values()) {
      trace(
        ctx,
        largeur,
        hauteur,
        trait.couleur,
        trait.epaisseur,
        trait.points,
      );
    }
  }

  dessineMorceau(
    ctx: CanvasRenderingContext2D,
    largeur: number,
    hauteur: number,
    morceau: Morceau,
  ) {
    trace(ctx, largeur, hauteur, morceau.c, morceau.w, this.ajoute(morceau));
  }
}

const trace = (
  ctx: CanvasRenderingContext2D,
  largeur: number,
  hauteur: number,
  couleur: string,
  epaisseur: number,
  points: number[],
) => {
  if (points.length === 0) {
    return;
  }
  const gomme = couleur === GOMME;
  ctx.globalCompositeOperation = gomme ? "destination-out" : "source-over";
  ctx.strokeStyle = gomme ? "#000" : couleur;
  ctx.fillStyle = gomme ? "#000" : couleur;
  ctx.lineWidth = Math.max(1, epaisseur * largeur);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (points.length === 2) {
    ctx.beginPath();
    ctx.arc(
      points[0] * largeur,
      points[1] * hauteur,
      ctx.lineWidth / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0] * largeur, points[1] * hauteur);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i] * largeur, points[i + 1] * hauteur);
  }
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
};
