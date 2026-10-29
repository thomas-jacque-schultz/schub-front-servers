import { useCallback, useEffect, useRef, useState } from "react";
import { DrawingGuide, type DrawingPoint } from "../../common";
import type { Flux } from "./flux";
import { arrondi, GOMME, type Morceau, RATIO, Tableau } from "./traits";

const ENVOI_MS = 50;
// Un cran d'épaisseur par cran de molette ; un pavé tactile envoie des pas bien plus petits, qui s'additionnent.
const PAS_MOLETTE = 50;
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
  onMorceau: (morceau: Morceau) => void;
  recus: Flux<Morceau>;
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
  onMorceau,
  recus,
  onCran,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const enCours = useRef<{ id: string; points: number[] } | null>(null);
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
      recus.abonne((morceau) => {
        const lu = contexte();
        if (lu) {
          tableau.dessineMorceau(lu.ctx, lu.largeur, lu.hauteur, morceau);
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
    onMorceau(morceau);
  }, [couleur, epaisseur, onMorceau]);

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

  const droite = (vers: number[]) => {
    const depuis = dernier.current;
    if (!depuis) {
      return false;
    }
    const morceau: Morceau = {
      k: "t",
      id: `${auteur}-${compteur.current++}`,
      c: couleur,
      w: epaisseur,
      p: [...depuis, ...vers],
    };
    const lu = contexte();
    if (lu) {
      tableau.dessineMorceau(lu.ctx, lu.largeur, lu.hauteur, morceau);
    }
    onMorceau(morceau);
    dernier.current = vers;
    return true;
  };

  const dessineLocal = (points: number[]) => {
    const lu = contexte();
    const trait = enCours.current;
    if (lu && trait) {
      tableau.dessineMorceau(lu.ctx, lu.largeur, lu.hauteur, {
        k: "t",
        id: trait.id,
        c: couleur,
        w: epaisseur,
        p: points,
      });
    }
  };

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
          if (event.altKey && droite(p)) {
            return;
          }
          event.currentTarget.setPointerCapture(event.pointerId);
          enCours.current = {
            id: `${auteur}-${compteur.current++}`,
            points: [],
          };
          enCours.current.points.push(...p);
          dernier.current = p;
          dessineLocal(p);
        }}
        onPointerMove={(event) => {
          if (actif && event.pointerType === "mouse") {
            const [x, y] = point(event);
            setSurvol({ x, y });
            setAlt(event.altKey);
          }
          if (!enCours.current) {
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
          enCours.current.points.push(...nouveaux);
          dernier.current = nouveaux.slice(-2);
          dessineLocal(nouveaux);
        }}
        onPointerLeave={() => setSurvol(null)}
        onPointerUp={() => {
          envoie();
          enCours.current = null;
        }}
        onPointerCancel={() => {
          envoie();
          enCours.current = null;
        }}
      />
      {actif && (
        <DrawingGuide
          point={survol}
          width={epaisseur}
          color={couleur === GOMME ? undefined : couleur}
          from={alt && !enCours.current ? dernierPoint(dernier.current) : null}
        />
      )}
    </>
  );
}

const dernierPoint = (p: number[] | null): DrawingPoint | null =>
  p ? { x: p[0], y: p[1] } : null;
