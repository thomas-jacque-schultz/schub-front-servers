import { useCallback, useEffect, useRef, useState } from "react";
import {
  DrawingGuide,
  type DrawingPoint,
  type DrawingShape,
} from "../../common";
import type { Flux } from "./flux";
import {
  arrondi,
  forme,
  GOMME,
  type Morceau,
  type Operation,
  RATIO,
  Tableau,
} from "./traits";

/** Le feutre à main levée, deux formes à glisser d'un coin à l'autre, et le pot de peinture (Schub#164). */
export type Outil = "feutre" | "rectangle" | "cercle" | "pot";

const ENVOI_MS = 50;
// Un cran d'épaisseur par cran de molette (100 dans Chrome) ; un pavé tactile envoie des pas plus petits, qui s'additionnent.
const PAS_MOLETTE = 100;
const LIGNE_PX = 33;

interface Props {
  tableau: Tableau;
  couleur: string;
  epaisseur: number;
  // Change à chaque effacement ou rejeu de l'historique : le tableau se redessine en entier.
  version: number;
  auteur: string;
  // Pendant une partie, seul le dessinateur dessine.
  actif: boolean;
  outil: Outil;
  onOperation: (operation: Operation) => void;
  recus: Flux<Operation>;
  /** La molette au-dessus du tableau : +1 pour un trait plus épais, -1 pour plus fin. */
  onCran: (sens: 1 | -1) => void;
}

export function Board({
  tableau,
  couleur,
  epaisseur,
  version,
  auteur,
  actif,
  outil,
  onOperation,
  recus,
  onCran,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const enCours = useRef<{ id: string; points: number[] } | null>(null);
  // L'origine d'un rectangle ou d'un cercle qu'on glisse.
  const origine = useRef<number[] | null>(null);
  const compteur = useRef(0);
  // Le dernier point de mon dernier trait : Alt + clic trace une droite depuis lui (Schub#160).
  const dernier = useRef<number[] | null>(null);
  const [survol, setSurvol] = useState<DrawingPoint | null>(null);
  const [alt, setAlt] = useState(false);

  const contexte = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    return c && ctx ? { ctx, largeur: c.width, hauteur: c.height } : null;
  }, []);

  const redessine = useCallback(() => {
    const c = canvas.current;
    if (!c) {
      return;
    }
    const echelle = window.devicePixelRatio || 1;
    c.width = Math.round(c.clientWidth * echelle);
    c.height = Math.round((c.clientWidth * echelle) / RATIO);
    const lu = contexte();
    if (lu) {
      tableau.dessine(lu.ctx, lu.largeur, lu.hauteur);
    }
  }, [contexte, tableau]);

  useEffect(() => {
    redessine();
    const observe = new ResizeObserver(redessine);
    if (canvas.current) {
      observe.observe(canvas.current);
    }
    return () => observe.disconnect();
  }, [redessine, version]);

  useEffect(() => {
    dernier.current = null;
  }, [version]);

  // React pose ses écouteurs de molette en passif : seul un écouteur posé à la main peut empêcher le défilement.
  useEffect(() => {
    const c = canvas.current;
    if (!c || !actif) {
      return;
    }
    let cumul = 0;
    const molette = (event: WheelEvent) => {
      event.preventDefault();
      cumul += event.deltaMode === 1 ? event.deltaY * LIGNE_PX : event.deltaY;
      while (Math.abs(cumul) >= PAS_MOLETTE) {
        onCran(cumul < 0 ? 1 : -1);
        cumul -= Math.sign(cumul) * PAS_MOLETTE;
      }
    };
    c.addEventListener("wheel", molette, { passive: false });
    return () => c.removeEventListener("wheel", molette);
  }, [actif, onCran]);

  // Sous Firefox Windows, relâcher Alt ouvre la barre de menus : au-dessus du tableau, la touche ne sert qu'à lui.
  useEffect(() => {
    if (!actif) {
      return;
    }
    const touche = (event: KeyboardEvent) => {
      setAlt(event.altKey);
      if (event.key === "Alt" && survol) {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", touche);
    window.addEventListener("keyup", touche);
    return () => {
      window.removeEventListener("keydown", touche);
      window.removeEventListener("keyup", touche);
    };
  }, [actif, survol]);

  useEffect(
    () =>
      recus.abonne((operation) => {
        const lu = contexte();
        if (lu) {
          tableau.applique(lu.ctx, lu.largeur, lu.hauteur, operation);
        }
      }),
    [contexte, recus, tableau],
  );

  const envoie = useCallback(() => {
    const trait = enCours.current;
    if (!trait || trait.points.length === 0) {
      return;
    }
    const morceau: Morceau = {
      k: "t",
      id: trait.id,
      c: couleur,
      w: epaisseur,
      p: trait.points,
    };
    trait.points = [];
    onOperation(morceau);
  }, [couleur, epaisseur, onOperation]);

  useEffect(() => {
    const minuterie = window.setInterval(envoie, ENVOI_MS);
    return () => window.clearInterval(minuterie);
  }, [envoie]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>): number[] => {
    const cadre = event.currentTarget.getBoundingClientRect();
    return [
      arrondi((event.clientX - cadre.left) / cadre.width),
      arrondi((event.clientY - cadre.top) / cadre.height),
    ];
  };

  const nouvelId = () => `${auteur}-${compteur.current++}`;

  const dessineLocal = (operation: Operation) => {
    const lu = contexte();
    if (lu) {
      tableau.applique(lu.ctx, lu.largeur, lu.hauteur, operation);
    }
  };

  /** Un trait d'un seul envoi : la droite à l'Alt + clic, un rectangle, un cercle. */
  const traitEntier = (points: number[]) => {
    const morceau: Morceau = {
      k: "t",
      id: nouvelId(),
      c: couleur,
      w: epaisseur,
      p: points,
    };
    dessineLocal(morceau);
    onOperation(morceau);
    dernier.current = points.slice(-2);
  };

  const commence = (p: number[]) => {
    if (outil === "pot") {
      const remplissage: Operation = { k: "r", id: nouvelId(), c: couleur, p };
      dessineLocal(remplissage);
      onOperation(remplissage);
      return false;
    }
    if (outil !== "feutre") {
      origine.current = p;
      return true;
    }
    enCours.current = { id: nouvelId(), points: [...p] };
    dernier.current = p;
    dessineLocal({
      k: "t",
      id: enCours.current.id,
      c: couleur,
      w: epaisseur,
      p,
    });
    return true;
  };

  const termine = (p: number[] | null) => {
    if (origine.current && p && outil !== "feutre" && outil !== "pot") {
      traitEntier(forme(outil, origine.current, p));
    }
    origine.current = null;
    envoie();
    enCours.current = null;
  };

  const apercu: DrawingShape | null = origine.current
    ? {
        kind: outil === "cercle" ? "ellipse" : "rectangle",
        from: versPoint(origine.current),
      }
    : alt && outil === "feutre" && !enCours.current && dernier.current
      ? { kind: "line", from: versPoint(dernier.current) }
      : null;

  return (
    <>
      <canvas
        ref={canvas}
        style={{ touchAction: "none", cursor: actif ? "crosshair" : "default" }}
        onPointerDown={(event) => {
          if (!actif) {
            return;
          }
          const p = point(event);
          if (event.altKey && outil === "feutre" && dernier.current) {
            traitEntier([...dernier.current, ...p]);
            return;
          }
          if (commence(p)) {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerMove={(event) => {
          if (actif && event.pointerType === "mouse") {
            const [x, y] = point(event);
            setSurvol({ x, y });
            setAlt(event.altKey);
          }
          const trait = enCours.current;
          if (!trait) {
            return;
          }
          const nouveaux = event.nativeEvent.getCoalescedEvents?.().length
            ? event.nativeEvent.getCoalescedEvents().flatMap((e) => {
                const cadre = event.currentTarget.getBoundingClientRect();
                return [
                  arrondi((e.clientX - cadre.left) / cadre.width),
                  arrondi((e.clientY - cadre.top) / cadre.height),
                ];
              })
            : point(event);
          trait.points.push(...nouveaux);
          dernier.current = nouveaux.slice(-2);
          dessineLocal({
            k: "t",
            id: trait.id,
            c: couleur,
            w: epaisseur,
            p: nouveaux,
          });
        }}
        onPointerLeave={() => setSurvol(null)}
        onPointerUp={(event) => termine(point(event))}
        onPointerCancel={() => termine(null)}
      />
      {actif && (
        <DrawingGuide
          point={survol}
          width={epaisseur}
          color={couleur === GOMME ? undefined : couleur}
          shape={apercu}
        />
      )}
    </>
  );
}

const versPoint = ([x, y]: number[]): DrawingPoint => ({ x, y });
