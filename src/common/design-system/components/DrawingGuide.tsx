import Box from "@mui/material/Box";
import { useEffect, useRef, useState } from "react";

/** Un point du tableau, en coordonnées relatives (de 0 à 1). */
export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingGuideProps {
  /** Le curseur au-dessus du tableau ; null quand il en sort. */
  point: DrawingPoint | null;
  /** L'épaisseur du trait, relative à la largeur du tableau. */
  width: number;
  /** La couleur du feutre ; absente, c'est la gomme (cercle en pointillés). */
  color?: string;
  /** L'origine d'une droite en préparation : elle s'affiche du point d'origine au curseur. */
  from?: DrawingPoint | null;
}

/**
 * L'aperçu du feutre posé sur un tableau à dessin (Schub#160) : un cercle de la taille du trait sous le curseur, et
 * la droite que tracera le prochain clic. Il se place dans une `GameStage`, au-dessus du canvas, sans capter la
 * souris.
 */
export function DrawingGuide({
  point,
  width,
  color,
  from = null,
}: DrawingGuideProps) {
  const calque = useRef<SVGSVGElement>(null);
  const [taille, setTaille] = useState({ l: 0, h: 0 });

  useEffect(() => {
    const svg = calque.current;
    if (!svg) {
      return;
    }
    const mesure = () => setTaille({ l: svg.clientWidth, h: svg.clientHeight });
    mesure();
    const observe = new ResizeObserver(mesure);
    observe.observe(svg);
    return () => observe.disconnect();
  }, []);

  const { l, h } = taille;
  const diametre = Math.max(2, width * l);
  return (
    <Box
      component="svg"
      ref={calque}
      aria-hidden
      viewBox={`0 0 ${l || 1} ${h || 1}`}
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {point && from && (
        <line
          x1={from.x * l}
          y1={from.y * h}
          x2={point.x * l}
          y2={point.y * h}
          stroke={color ?? "currentColor"}
          strokeOpacity={0.55}
          strokeWidth={diametre}
          strokeLinecap="round"
        />
      )}
      {point && (
        <Box
          component="circle"
          cx={point.x * l}
          cy={point.y * h}
          r={diametre / 2}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray={color ? undefined : "3 3"}
          sx={{ stroke: color ?? "currentColor", color: "text.secondary" }}
        />
      )}
    </Box>
  );
}
