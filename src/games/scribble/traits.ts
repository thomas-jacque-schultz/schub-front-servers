import { enRgba, remplis } from "./remplissage";

// Un trait est envoyé par morceaux (toutes les ~50 ms), en coordonnées relatives au tableau (de 0 à 1) :
// les écrans de tailles différentes voient le même dessin. Épaisseur relative à la largeur du tableau.
export interface Morceau {
  k: "t";
  id: string;
  c: string;
  w: number;
  p: number[];
}

/** Le pot de peinture (Schub#164) : une couleur versée au point p. */
export interface Remplissage {
  k: "r";
  id: string;
  c: string;
  p: number[];
}

/** Retire un trait ou un remplissage (Schub#164) ; rejouée à qui arrive, comme le reste de l'historique. */
export interface Annulation {
  k: "u";
  id: string;
}

export type Operation = Morceau | Remplissage | Annulation;

interface Trait {
  k: "t";
  couleur: string;
  epaisseur: number;
  points: number[];
}

interface Versement {
  k: "r";
  couleur: string;
  point: number[];
}

export const RATIO = 4 / 3;

// La gomme est un trait comme un autre : rejouée dans l'ordre, elle efface ce qui la précède.
export const GOMME = "gomme";

export const arrondi = (valeur: number): number =>
  Math.round(Math.min(1, Math.max(0, valeur)) * 10_000) / 10_000;

const estPoints = (p: unknown, longueur?: number): p is number[] =>
  Array.isArray(p) &&
  p.length % 2 === 0 &&
  (longueur === undefined || p.length === longueur) &&
  p.every((v) => typeof v === "number");

export const estMorceau = (data: unknown): data is Morceau => {
  const m = data as Partial<Morceau> | null;
  return (
    m?.k === "t" &&
    typeof m.id === "string" &&
    typeof m.c === "string" &&
    typeof m.w === "number" &&
    estPoints(m.p)
  );
};

export const estOperation = (data: unknown): data is Operation => {
  const o = data as Partial<Record<"k" | "id" | "c" | "p", unknown>> | null;
  return (
    estMorceau(data) ||
    (o?.k === "r" &&
      typeof o.id === "string" &&
      typeof o.c === "string" &&
      estPoints(o.p, 2)) ||
    (o?.k === "u" && typeof o.id === "string")
  );
};

/** Le dessin, comme la suite de ce qui y a été fait : un trait ou un remplissage annulé en sort. */
export class Tableau {
  private readonly faits = new Map<string, Trait | Versement>();

  // Les points nouveaux d'un trait, précédés de son dernier point déjà connu : de quoi tracer la suite seule.
  ajoute(morceau: Morceau): number[] {
    const connu = this.faits.get(morceau.id);
    const trait: Trait =
      connu?.k === "t"
        ? connu
        : { k: "t", couleur: morceau.c, epaisseur: morceau.w, points: [] };
    const avant = trait.points.slice(-2);
    trait.points.push(...morceau.p);
    this.faits.set(morceau.id, trait);
    return [...avant, ...morceau.p];
  }

  enregistre(operation: Operation) {
    if (operation.k === "t") {
      this.ajoute(operation);
    } else if (operation.k === "r") {
      this.faits.set(operation.id, {
        k: "r",
        couleur: operation.c,
        point: operation.p,
      });
    } else {
      this.faits.delete(operation.id);
    }
  }

  vide() {
    this.faits.clear();
  }

  dessine(ctx: CanvasRenderingContext2D, largeur: number, hauteur: number) {
    ctx.clearRect(0, 0, largeur, hauteur);
    for (const fait of this.faits.values()) {
      if (fait.k === "t") {
        trace(ctx, largeur, hauteur, fait.couleur, fait.epaisseur, fait.points);
      } else {
        verse(ctx, largeur, hauteur, fait.couleur, fait.point);
      }
    }
  }

  /** Enregistre l'opération et la dessine ; une annulation redessine tout. */
  applique(
    ctx: CanvasRenderingContext2D,
    largeur: number,
    hauteur: number,
    operation: Operation,
  ) {
    if (operation.k === "t") {
      trace(
        ctx,
        largeur,
        hauteur,
        operation.c,
        operation.w,
        this.ajoute(operation),
      );
      return;
    }
    this.enregistre(operation);
    if (operation.k === "r") {
      verse(ctx, largeur, hauteur, operation.c, operation.p);
    } else {
      this.dessine(ctx, largeur, hauteur);
    }
  }
}

const verse = (
  ctx: CanvasRenderingContext2D,
  largeur: number,
  hauteur: number,
  couleur: string,
  point: number[],
) => {
  const image = ctx.getImageData(0, 0, largeur, hauteur);
  const rempli = remplis(
    image,
    Math.floor(point[0] * (largeur - 1)),
    Math.floor(point[1] * (hauteur - 1)),
    enRgba(couleur === GOMME ? null : couleur),
  );
  if (rempli) {
    ctx.putImageData(image, 0, 0);
  }
};

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

const COTES_ELLIPSE = 48;

/** Un rectangle ou une ellipse tracés d'un coin à l'autre (Schub#164) : pour le relais, un trait comme un autre. */
export const forme = (
  type: "rectangle" | "cercle",
  [x1, y1]: number[],
  [x2, y2]: number[],
): number[] => {
  if (type === "rectangle") {
    return [x1, y1, x2, y1, x2, y2, x1, y2, x1, y1];
  }
  const [cx, cy, rx, ry] = [
    (x1 + x2) / 2,
    (y1 + y2) / 2,
    (x2 - x1) / 2,
    (y2 - y1) / 2,
  ];
  return Array.from({ length: COTES_ELLIPSE + 1 }, (_, i) => {
    const angle = (i / COTES_ELLIPSE) * Math.PI * 2;
    return [
      arrondi(cx + rx * Math.cos(angle)),
      arrondi(cy + ry * Math.sin(angle)),
    ];
  }).flat();
};
