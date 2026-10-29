import { useEffect, useRef, useState, type PointerEvent } from "react";
import Box from "@mui/material/Box";
import { useChartScheme } from "./useChartScheme";
import { dessineFormes } from "./macroDessin";
import { masquesDe, peindre, type Masques } from "./macroTerrain";
import {
  MAP_BOUNDS,
  toScreen,
  toWorld,
  unitsPerPixel,
  type MapPoint,
} from "./macroMap";
// La minimap de la Faille, tirée des fichiers du jeu (Community Dragon,
// game/assets/maps/info/map11/2dlevelminimap_base_baron1.png) : seule sa forme sert, repeinte aux couleurs du site.
import minimap from "../assets/faille-minimap.png";

export type MacroMapLandmarkKind =
  "fountain" | "nexus" | "tower" | "inhibitor" | "camp" | "objective" | "crab";

export interface MacroMapLandmark extends MapPoint {
  kind: MacroMapLandmarkKind;
  side: "blue" | "red" | "neutral";
}

/** Une couleur du thème (la marque, un camp), ou l'encre d'un dessin. */
export type MacroColor =
  "mark" | "markSecondary" | "blue" | "red" | "neutral" | `#${string}`;

/**
 * Ce que la carte sait dessiner, en coordonnées du jeu. Une épaisseur est relative à la largeur de la carte, comme
 * celle d'un feutre (`inkWidths`) ; un rayon de portée est en unités du jeu.
 */
export type MacroShape =
  | {
      kind: "line";
      from: MapPoint;
      to: MapPoint;
      color: MacroColor;
      width: number;
      arrow?: boolean;
    }
  | {
      kind: "path";
      points: readonly MapPoint[];
      color: MacroColor;
      width: number;
    }
  | {
      kind: "rectangle" | "ellipse";
      from: MapPoint;
      to: MapPoint;
      color: MacroColor;
      width: number;
    }
  | { kind: "range"; center: MapPoint; radius: number; color: MacroColor }
  | { kind: "point"; at: MapPoint; letter: string; color: MacroColor }
  | { kind: "label"; at: MapPoint; text: string }
  | {
      kind: "icon";
      at: MapPoint;
      src: string;
      round?: boolean;
      ring?: MacroColor;
    }
  | { kind: "selection"; at: MapPoint };

/** Le curseur d'un autre membre, nommé. */
export interface MacroCursor {
  id: string;
  name: string;
  at: MapPoint;
  color: MacroColor;
}

export interface MacroPointer {
  phase: "down" | "move" | "up" | "hover" | "leave" | "cancel";
  /** Le point visé, en unités du jeu entières, borné à la carte. */
  at: MapPoint;
  unitsPerPixel: number;
}

export interface MacroMapProps {
  /** Ce que dit la carte aux lecteurs d'écran. */
  label: string;
  landmarks: readonly MacroMapLandmark[];
  shapes: readonly MacroShape[];
  cursors?: readonly MacroCursor[];
  cursor?: "crosshair" | "pointer" | "grab" | "cell";
  onPointer?: (pointer: MacroPointer) => void;
  /** La molette, cran par cran : 1 vers le haut. Sans elle, la molette fait défiler la page. */
  onWheelStep?: (step: 1 | -1) => void;
  maxWidth?: number;
}

// Chrome envoie 100 par cran de molette, Firefox des lignes.
const PAS_MOLETTE = 100;
const LIGNE_PX = 33;

/**
 * La Faille du Macro Planner (Schub#168) : la minimap du jeu repeinte, ses repères, et ce qu'on y pose. Elle dessine
 * des formes et rend les gestes en unités du jeu, sans rien savoir des outils qui les produisent.
 */
export function MacroMap({
  label,
  landmarks,
  shapes,
  cursors = [],
  cursor = "crosshair",
  onPointer,
  onWheelStep,
  maxWidth,
}: MacroMapProps) {
  const { chart, map, palette } = useChartScheme();
  const cadre = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);
  // Un canvas ne se redessine pas seul quand la police ou une image arrive : on compte les arrivées.
  const [arrivees, setArrivees] = useState(0);
  const [masques, setMasques] = useState<Masques | null>(null);
  const [terrain, setTerrain] = useState<HTMLCanvasElement | null>(null);
  const images = useRef(new Map<string, HTMLImageElement>());
  const appuye = useRef(false);

  useEffect(() => {
    const element = cadre.current;
    if (!element) {
      return;
    }
    const observateur = new ResizeObserver(([entree]) =>
      setSize(Math.floor(entree.contentRect.width)),
    );
    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  useEffect(() => {
    let actif = true;
    // fonts.ready ne rejette jamais : la promesse est ignorée exprès.
    void document.fonts?.ready.then(() => actif && setArrivees((n) => n + 1));
    const image = new Image();
    image.onload = () => actif && setMasques(masquesDe(image));
    image.src = minimap;
    return () => {
      actif = false;
    };
  }, []);

  // La carte peinte une fois par thème, à la taille de la minimap ; chaque rendu ne fait que la recopier.
  useEffect(() => {
    if (!masques) {
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = masques.sol.width;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.fillStyle = map.jungle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    peindre(ctx, masques.sol, map.lane);
    peindre(ctx, masques.riviere, map.river);
    peindre(ctx, masques.baseBleue, map.blueBase);
    peindre(ctx, masques.baseRouge, map.redBase);
    setTerrain(canvas);
  }, [masques, map]);

  // React pose ses écouteurs de molette en passif : seul un écouteur posé à la main peut empêcher le défilement.
  useEffect(() => {
    const canvas = toile.current;
    if (!canvas || !onWheelStep) {
      return;
    }
    let cumul = 0;
    const molette = (event: WheelEvent) => {
      event.preventDefault();
      cumul += event.deltaMode === 1 ? event.deltaY * LIGNE_PX : event.deltaY;
      while (Math.abs(cumul) >= PAS_MOLETTE) {
        onWheelStep(cumul < 0 ? 1 : -1);
        cumul -= Math.sign(cumul) * PAS_MOLETTE;
      }
    };
    canvas.addEventListener("wheel", molette, { passive: false });
    return () => canvas.removeEventListener("wheel", molette);
  }, [onWheelStep]);

  useEffect(() => {
    const canvas = toile.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || size === 0) {
      return;
    }
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const ecran = (point: MapPoint) => toScreen(point, size);
    const teinte = (couleur: MacroColor): string => {
      switch (couleur) {
        case "mark":
          return chart.mark;
        case "markSecondary":
          return chart.markSecondary;
        case "blue":
          return map.blue;
        case "red":
          return map.red;
        case "neutral":
          return map.objective;
        default:
          return couleur;
      }
    };
    const image = (src: string) => {
      const connue = images.current.get(src);
      if (connue) {
        return connue.complete && connue.naturalWidth > 0 ? connue : null;
      }
      const neuve = new Image();
      neuve.onload = () => setArrivees((n) => n + 1);
      neuve.src = src;
      images.current.set(src, neuve);
      return null;
    };

    ctx.fillStyle = map.jungle;
    ctx.fillRect(0, 0, size, size);
    if (terrain) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(terrain, 0, 0, size, size);
    }

    ctx.strokeStyle = map.grid;
    ctx.lineWidth = 1;
    for (let pas = 0; pas <= MAP_BOUNDS.maxY; pas += 1000) {
      const { x, y } = ecran({ x: pas, y: pas });
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    for (const repere of landmarks) {
      const { x, y } = ecran(repere);
      const camp =
        repere.side === "blue"
          ? map.blue
          : repere.side === "red"
            ? map.red
            : map.objective;
      ctx.fillStyle = camp;
      ctx.strokeStyle = camp;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      switch (repere.kind) {
        case "tower":
          ctx.rect(x - 3.5, y - 3.5, 7, 7);
          ctx.fill();
          break;
        case "inhibitor":
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "nexus":
          ctx.moveTo(x, y - 7);
          ctx.lineTo(x + 7, y);
          ctx.lineTo(x, y + 7);
          ctx.lineTo(x - 7, y);
          ctx.closePath();
          ctx.fill();
          break;
        case "fountain":
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "camp":
          ctx.fillStyle = map.camp;
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "objective":
          ctx.arc(x, y, 6.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "crab":
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }
    }

    dessineFormes(
      {
        ctx,
        size,
        teinte,
        papier: palette.background.paper,
        texte: palette.text.primary,
        image,
      },
      shapes,
      cursors,
    );
  }, [
    size,
    shapes,
    cursors,
    landmarks,
    map,
    chart,
    palette,
    terrain,
    arrivees,
  ]);

  const geste = (
    evenement: PointerEvent<HTMLCanvasElement>,
    phase: MacroPointer["phase"],
  ) => {
    if (!onPointer || size === 0) {
      return;
    }
    const rect = evenement.currentTarget.getBoundingClientRect();
    const brut = toWorld(
      { x: evenement.clientX - rect.left, y: evenement.clientY - rect.top },
      size,
    );
    onPointer({
      phase,
      at: { x: Math.round(brut.x), y: Math.round(brut.y) },
      unitsPerPixel: unitsPerPixel(size),
    });
  };

  return (
    <Box
      ref={cadre}
      sx={{ width: "100%", maxWidth, mx: "auto", aspectRatio: "1" }}
    >
      <Box
        component="canvas"
        ref={toile}
        role="img"
        aria-label={label}
        onPointerDown={(evenement: PointerEvent<HTMLCanvasElement>) => {
          if (evenement.button !== 0) {
            return;
          }
          evenement.currentTarget.setPointerCapture(evenement.pointerId);
          appuye.current = true;
          geste(evenement, "down");
        }}
        onPointerMove={(evenement: PointerEvent<HTMLCanvasElement>) =>
          geste(evenement, appuye.current ? "move" : "hover")
        }
        onPointerUp={(evenement: PointerEvent<HTMLCanvasElement>) => {
          if (!appuye.current) {
            return;
          }
          appuye.current = false;
          geste(evenement, "up");
        }}
        onPointerCancel={(evenement: PointerEvent<HTMLCanvasElement>) => {
          appuye.current = false;
          geste(evenement, "cancel");
        }}
        onPointerLeave={(evenement: PointerEvent<HTMLCanvasElement>) => {
          if (!appuye.current) {
            geste(evenement, "leave");
          }
        }}
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          borderRadius: 1,
          cursor,
          touchAction: "none",
        }}
      />
    </Box>
  );
}
