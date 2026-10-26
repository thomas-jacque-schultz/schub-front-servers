import { useEffect, useRef, useState, type PointerEvent } from "react";
import Box from "@mui/material/Box";
import { useChartScheme } from "./useChartScheme";
import {
  MAP_BOUNDS,
  radiusOnScreen,
  snapTo,
  terrainAt,
  toScreen,
  toWorld,
  type MapPoint,
} from "./mapRuler";
import { typographyTokens } from "../tokens";
// La minimap de la Faille, tirée des fichiers du jeu (Community Dragon,
// game/assets/maps/info/map11/2dlevelminimap_base_baron1.png) : seule sa forme sert, repeinte aux couleurs du site.
import minimap from "../assets/faille-minimap.png";

export type MapRulerLandmarkKind =
  "fountain" | "nexus" | "tower" | "inhibitor" | "camp" | "objective" | "crab";

export interface MapRulerLandmark extends MapPoint {
  kind: MapRulerLandmarkKind;
  side: "blue" | "red" | "neutral";
}

export interface MapRulerProps {
  /** Ce que dit la carte aux lecteurs d'écran : la mesure en cours, en toutes lettres. */
  label: string;
  landmarks: readonly MapRulerLandmark[];
  a: MapPoint;
  b: MapPoint;
  /** Le cercle de portée centré sur A, en unités du jeu. */
  radius: number;
  snap: boolean;
  /** La distance, écrite au milieu du segment. */
  measureLabel: string;
  onChange: (a: MapPoint, b: MapPoint) => void;
  maxWidth?: number;
}

const AIMANT_PX = 14;
// En deçà, un toucher reste un toucher : il déplace A et garde B.
const SEUIL_GLISSER_PX = 4;

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

export function MapRuler({
  label,
  landmarks,
  a,
  b,
  radius,
  snap,
  measureLabel,
  onChange,
  maxWidth,
}: MapRulerProps) {
  const { chart, map, palette } = useChartScheme();
  const cadre = useRef<HTMLDivElement>(null);
  const toile = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(0);
  // Un canvas ne se redessine pas seul quand la police arrive : on attend qu'elle soit là.
  const [policesPretes, setPolicesPretes] = useState(false);
  const [masques, setMasques] = useState<Masques | null>(null);
  const [terrain, setTerrain] = useState<HTMLCanvasElement | null>(null);
  const geste = useRef<{ depart: MapPoint; glisse: boolean } | null>(null);

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
    void document.fonts?.ready.then(() => actif && setPolicesPretes(true));
    const image = new Image();
    image.onload = () => actif && setMasques(masquesDe(image));
    image.src = minimap;
    return () => {
      actif = false;
    };
  }, []);

  // La carte peinte une fois par thème, à la taille de la minimap ; chaque mesure ne fait que la recopier.
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

    const pa = ecran(a);
    const pb = ecran(b);
    const portee = radiusOnScreen(radius, size);

    ctx.setLineDash([6, 4]);
    ctx.fillStyle = chart.markSoft;
    ctx.strokeStyle = chart.mark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(pa.x, pa.y, portee.x, portee.y, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = chart.mark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();

    const mono = typographyTokens.monospaceFontFamily;
    for (const [point, lettre, teinte] of [
      [pa, "A", chart.mark],
      [pb, "B", chart.markSecondary],
    ] as const) {
      ctx.fillStyle = teinte;
      ctx.strokeStyle = palette.background.paper;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = `700 13px ${mono}`;
      ctx.fillStyle = palette.text.primary;
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(lettre, point.x + 8, point.y - 6);
    }

    if (measureLabel) {
      ctx.font = `700 12px ${mono}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const largeur = ctx.measureText(measureLabel).width + 10;
      const mx = Math.min(
        size - largeur / 2,
        Math.max(largeur / 2, (pa.x + pb.x) / 2),
      );
      const my = Math.min(size - 10, Math.max(10, (pa.y + pb.y) / 2 - 14));
      ctx.fillStyle = palette.background.paper;
      ctx.fillRect(mx - largeur / 2, my - 10, largeur, 20);
      ctx.fillStyle = palette.text.primary;
      ctx.fillText(measureLabel, mx, my + 1);
    }
  }, [
    size,
    a,
    b,
    radius,
    landmarks,
    measureLabel,
    map,
    chart,
    palette,
    terrain,
    policesPretes,
  ]);

  const pointeur = (evenement: PointerEvent<HTMLCanvasElement>): MapPoint => {
    const rect = evenement.currentTarget.getBoundingClientRect();
    return {
      x: evenement.clientX - rect.left,
      y: evenement.clientY - rect.top,
    };
  };
  const monde = (point: MapPoint): MapPoint => {
    const brut = toWorld(point, size);
    if (!snap) {
      return { x: Math.round(brut.x), y: Math.round(brut.y) };
    }
    const aimante = snapTo(brut, landmarks, size, AIMANT_PX);
    return { x: Math.round(aimante.x), y: Math.round(aimante.y) };
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
          evenement.currentTarget.setPointerCapture(evenement.pointerId);
          geste.current = { depart: pointeur(evenement), glisse: false };
        }}
        onPointerMove={(evenement: PointerEvent<HTMLCanvasElement>) => {
          const enCours = geste.current;
          if (!enCours) {
            return;
          }
          const ici = pointeur(evenement);
          if (
            !enCours.glisse &&
            Math.hypot(ici.x - enCours.depart.x, ici.y - enCours.depart.y) <
              SEUIL_GLISSER_PX
          ) {
            return;
          }
          enCours.glisse = true;
          onChange(monde(enCours.depart), monde(ici));
        }}
        onPointerUp={(evenement: PointerEvent<HTMLCanvasElement>) => {
          const enCours = geste.current;
          geste.current = null;
          if (enCours && !enCours.glisse) {
            onChange(monde(pointeur(evenement)), b);
          }
        }}
        onPointerCancel={() => {
          geste.current = null;
        }}
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          borderRadius: 1,
          cursor: "crosshair",
          touchAction: "none",
        }}
      />
    </Box>
  );
}
