import Box from "@mui/material/Box";
import { useEffect, useRef, useState } from "react";

/** Un point du tableau, en coordonnées relatives (de 0 à 1). */
export interface DrawingPoint {
  x: number;
  y: number;
}

/** Une forme en préparation, de son point d'origine au curseur. */
export interface DrawingShape {
  kind: "line" | "rectangle" | "ellipse";
  from: DrawingPoint;
}

export interface DrawingGuideProps {
  /** Le curseur au-dessus du tableau ; null quand il en sort. */
  point: DrawingPoint | null;
  /** L'épaisseur du trait, relative à la largeur du tableau. */
  width: number;
  /** La couleur du feutre ; absente, c'est la gomme (cercle en pointillés). */
  color?: string;
  /** La forme que tracera le prochain clic ou le relâchement. */
  shape?: DrawingShape | null;
}

/**
 * L'aperçu du feutre posé sur un tableau à dessin (Schub#160, #164) : un cercle de la taille du trait sous le
 * curseur, et la droite, le rectangle ou l'ellipse en préparation. Il se place dans une `GameStage`, au-dessus du
 * canvas, sans capter la souris.
 */
export function DrawingGuide({
  point,
  width,
  color,
  shape = null,
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
  const trait = {
    fill: "none",
    stroke: color ?? "currentColor",
    strokeOpacity: 0.55,
    strokeWidth: diametre,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const forme = (de: DrawingPoint, a: DrawingPoint) => {
    const [x1, y1, x2, y2] = [de.x * l, de.y * h, a.x * l, a.y * h];
    switch (shape?.kind) {
      case "line":
        return <line x1={x1} y1={y1} x2={x2} y2={y2} {...trait} />;
      case "rectangle":
        return (
          <rect
            x={Math.min(x1, x2)}
            y={Math.min(y1, y2)}
            width={Math.abs(x2 - x1)}
            height={Math.abs(y2 - y1)}
            {...trait}
          />
        );
      case "ellipse":
        return (
          <ellipse
            cx={(x1 + x2) / 2}
            cy={(y1 + y2) / 2}
            rx={Math.abs(x2 - x1) / 2}
            ry={Math.abs(y2 - y1) / 2}
            {...trait}
          />
        );
      default:
        return null;
    }
  };

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
        color: "text.secondary",
      }}
    >
      {point && shape && forme(shape.from, point)}
      {point && (
        <circle
          cx={point.x * l}
          cy={point.y * h}
          r={diametre / 2}
          fill="none"
          stroke={color ?? "currentColor"}
          strokeWidth={1.5}
          strokeDasharray={color ? undefined : "3 3"}
        />
      )}
    </Box>
  );
}
