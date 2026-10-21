import { useCallback, useEffect, useRef } from "react";
import type { Flux } from "./flux";
import { arrondi, type Morceau, RATIO, Tableau } from "./traits";

const ENVOI_MS = 50;

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
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const enCours = useRef<{ id: string; points: number[] } | null>(null);
  const compteur = useRef(0);

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
    <canvas
      ref={canvas}
      className={actif ? "tableau" : "tableau inactif"}
      onPointerDown={(event) => {
        if (!actif) {
          return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        enCours.current = { id: `${auteur}-${compteur.current++}`, points: [] };
        const p = point(event);
        enCours.current.points.push(...p);
        dessineLocal(p);
      }}
      onPointerMove={(event) => {
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
        dessineLocal(nouveaux);
      }}
      onPointerUp={() => {
        envoie();
        enCours.current = null;
      }}
      onPointerCancel={() => {
        envoie();
        enCours.current = null;
      }}
    />
  );
}
