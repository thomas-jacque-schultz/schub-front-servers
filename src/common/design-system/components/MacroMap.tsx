import { useEffect, useRef, useState, type PointerEvent } from "react";
import Box from "@mui/material/Box";
import { useChartScheme } from "./useChartScheme";
import {
  MAP_BOUNDS,
  radiusOnScreen,
  terrainAt,
  toScreen,
  toWorld,
  unitsPerPixel,
  type MapPoint,
} from "./macroMap";
import { typographyTokens } from "../tokens";
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
  | "mark"
  | "markSecondary"
  | "blue"
  | "red"
  | "neutral"
  | `#${string}`;

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
  | { kind: "path"; points: readonly MapPoint[]; color: MacroColor; width: number }
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
  | { kind: "icon"; at: MapPoint; src: string; round?: boolean; ring?: MacroColor }
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

interface Masques {
  sol: HTMLCanvasElement;
  riviere: HTMLCanvasElement;
  baseBleue: HTMLCanvasElement;
  baseRouge: HTMLCanvasElement;
}

// Un masque par zone, en blanc : son alpha dit la part du pixel qui appartient à la zone.
const masquesDe = (image: HTMLImageElement): Masques => {
  const cote = image.naturalWidth;
  const source = document.createElement("canvas");
  source.width = source.height = cote;
  const ctx = source.getContext("2d");
  if (!ctx) {
    throw new Error("canvas 2D indisponible");
  }
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, cote, cote).data;
  const vides = Array.from({ length: 4 }, () => new ImageData(cote, cote));
  const [sol, riviere, baseBleue, baseRouge] = vides;
  for (let i = 0; i < pixels.length; i += 4) {
    const u = ((i / 4) % cote) / cote;
    const v = Math.floor(i / 4 / cote) / cote;
    const zone = terrainAt(
      pixels[i],
      pixels[i + 1],
      pixels[i + 2],
      pixels[i + 3],
      u,
      v,
    );
    for (const masque of vides) {
      masque.data.fill(255, i, i + 3);
    }
    sol.data[i + 3] = zone.ground * 255;
    riviere.data[i + 3] = zone.river * 255;
    // La base bleue est en bas à gauche, la rouge en haut à droite.
    (u < v ? baseBleue : baseRouge).data[i + 3] = zone.base * 255;
  }
  return {
    sol: affiner(sol, true),
    riviere: affiner(riviere, false),
    baseBleue: affiner(baseBleue, false),
    baseRouge: affiner(baseRouge, false),
  };
};

// La minimap n'a pas d'anticrénelage : agrandie, elle montrerait ses marches. Le masque passe au double, flouté d'un
// pixel de l'image, puis le bord du sol se resserre autour de la mi-hauteur : les marches deviennent des courbes.
// Sans `filter` (Safari avant la 18), les marches restent, en plus fines.
const AFFINAGE = 2;
const affiner = (donnees: ImageData, net: boolean) => {
  const source = document.createElement("canvas");
  source.width = donnees.width;
  source.height = donnees.height;
  source.getContext("2d")?.putImageData(donnees, 0, 0);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = donnees.width * AFFINAGE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return source;
  }
  ctx.imageSmoothingQuality = "high";
  if (net) {
    ctx.filter = `blur(${AFFINAGE}px)`;
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  ctx.filter = "none";
  if (net) {
    const agrandi = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < agrandi.data.length; i += 4) {
      agrandi.data[i] = (agrandi.data[i] - 128) * 4 + 128;
    }
    ctx.putImageData(agrandi, 0, 0);
  }
  return canvas;
};

const peindre = (
  cible: CanvasRenderingContext2D,
  masque: HTMLCanvasElement,
  couleur: string,
) => {
  const calque = document.createElement("canvas");
  calque.width = masque.width;
  calque.height = masque.height;
  const ctx = calque.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.fillStyle = couleur;
  ctx.fillRect(0, 0, calque.width, calque.height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(masque, 0, 0);
  cible.drawImage(calque, 0, 0);
};

const tailleIcone = (size: number) => Math.min(36, Math.max(22, size * 0.045));

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
    const epaisseur = (largeur: number) => Math.max(1.5, largeur * size);
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
    const mono = typographyTokens.monospaceFontFamily;
    const etiquette = (texte: string, x: number, y: number, police: string) => {
      ctx.font = police;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const largeur = ctx.measureText(texte).width + 10;
      const mx = Math.min(size - largeur / 2, Math.max(largeur / 2, x));
      const my = Math.min(size - 10, Math.max(10, y));
      ctx.fillStyle = palette.background.paper;
      ctx.fillRect(mx - largeur / 2, my - 10, largeur, 20);
      ctx.fillStyle = palette.text.primary;
      ctx.fillText(texte, mx, my + 1);
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

    const icone = tailleIcone(size);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const forme of shapes) {
      switch (forme.kind) {
        case "line": {
          const de = ecran(forme.from);
          const a = ecran(forme.to);
          const largeur = epaisseur(forme.width);
          ctx.strokeStyle = teinte(forme.color);
          ctx.fillStyle = teinte(forme.color);
          ctx.lineWidth = largeur;
          const angle = Math.atan2(a.y - de.y, a.x - de.x);
          const pointe = Math.max(10, largeur * 3.5);
          // La pointe couvre le bout du trait : il s'arrête à sa base, sinon il dépasse en épais.
          const fin = forme.arrow
            ? {
                x: a.x - Math.cos(angle) * pointe * 0.8,
                y: a.y - Math.sin(angle) * pointe * 0.8,
              }
            : a;
          ctx.beginPath();
          ctx.moveTo(de.x, de.y);
          ctx.lineTo(fin.x, fin.y);
          ctx.stroke();
          if (forme.arrow) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(
              a.x - Math.cos(angle - 0.45) * pointe,
              a.y - Math.sin(angle - 0.45) * pointe,
            );
            ctx.lineTo(
              a.x - Math.cos(angle + 0.45) * pointe,
              a.y - Math.sin(angle + 0.45) * pointe,
            );
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case "path": {
          if (forme.points.length === 0) {
            break;
          }
          ctx.strokeStyle = teinte(forme.color);
          ctx.lineWidth = epaisseur(forme.width);
          ctx.beginPath();
          const premier = ecran(forme.points[0]);
          ctx.moveTo(premier.x, premier.y);
          for (const point of forme.points.slice(1)) {
            const p = ecran(point);
            ctx.lineTo(p.x, p.y);
          }
          // Un simple clic laisse un point.
          if (forme.points.length === 1) {
            ctx.lineTo(premier.x + 0.01, premier.y);
          }
          ctx.stroke();
          break;
        }
        case "rectangle":
        case "ellipse": {
          const de = ecran(forme.from);
          const a = ecran(forme.to);
          ctx.strokeStyle = teinte(forme.color);
          ctx.lineWidth = epaisseur(forme.width);
          ctx.beginPath();
          if (forme.kind === "rectangle") {
            ctx.rect(
              Math.min(de.x, a.x),
              Math.min(de.y, a.y),
              Math.abs(a.x - de.x),
              Math.abs(a.y - de.y),
            );
          } else {
            ctx.ellipse(
              (de.x + a.x) / 2,
              (de.y + a.y) / 2,
              Math.abs(a.x - de.x) / 2,
              Math.abs(a.y - de.y) / 2,
              0,
              0,
              Math.PI * 2,
            );
          }
          ctx.stroke();
          break;
        }
        case "range": {
          const centre = ecran(forme.center);
          const portee = radiusOnScreen(forme.radius, size);
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = teinte(forme.color);
          ctx.fillStyle = teinte(forme.color);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(centre.x, centre.y, portee.x, portee.y, 0, 0, Math.PI * 2);
          ctx.globalAlpha = 0.14;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.stroke();
          ctx.setLineDash([]);
          break;
        }
        case "point": {
          const p = ecran(forme.at);
          ctx.fillStyle = teinte(forme.color);
          ctx.strokeStyle = palette.background.paper;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.font = `700 13px ${mono}`;
          ctx.fillStyle = palette.text.primary;
          ctx.textBaseline = "bottom";
          ctx.textAlign = "left";
          ctx.fillText(forme.letter, p.x + 8, p.y - 6);
          break;
        }
        case "label": {
          const p = ecran(forme.at);
          etiquette(forme.text, p.x, p.y - 14, `700 12px ${mono}`);
          break;
        }
        case "icon": {
          const p = ecran(forme.at);
          const lue = image(forme.src);
          ctx.save();
          if (forme.round) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, icone / 2, 0, Math.PI * 2);
            ctx.fillStyle = palette.background.paper;
            ctx.fill();
            ctx.clip();
          }
          if (lue) {
            ctx.drawImage(lue, p.x - icone / 2, p.y - icone / 2, icone, icone);
          }
          ctx.restore();
          if (forme.ring) {
            ctx.strokeStyle = teinte(forme.ring);
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, icone / 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case "selection": {
          const p = ecran(forme.at);
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = palette.text.primary;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, icone * 0.68, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          break;
        }
      }
    }

    for (const autre of cursors) {
      const p = ecran(autre.at);
      ctx.fillStyle = teinte(autre.color);
      ctx.strokeStyle = palette.background.paper;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 4, p.y + 13);
      ctx.lineTo(p.x + 7, p.y + 8);
      ctx.lineTo(p.x + 13, p.y + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.font = `600 11px ${mono}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const largeur = ctx.measureText(autre.name).width + 8;
      ctx.fillStyle = teinte(autre.color);
      ctx.fillRect(p.x + 12, p.y + 12, largeur, 16);
      ctx.fillStyle = palette.background.paper;
      ctx.fillText(autre.name, p.x + 16, p.y + 14);
    }
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
