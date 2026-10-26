import { useEffect, useRef, useState, type PointerEvent } from "react";
import Box from "@mui/material/Box";
import { useChartScheme } from "./useChartScheme";
import { MAP_SIZE, snapTo, toScreen, toWorld, type MapPoint } from "./mapRuler";
import { typographyTokens } from "../tokens";

export type MapRulerLandmarkKind =
  "fountain" | "nexus" | "tower" | "camp" | "objective" | "crab";

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

// Le dessin de la carte, schématique : couloirs, rivière, bases en quarts de disque, tracés en unités du jeu.
const RAYON_BASE = 4600;
const LARGEUR_COULOIR = 820;
const LARGEUR_RIVIERE = 1300;
const COULOIRS: MapPoint[][] = [
  [
    { x: 1100, y: 4200 },
    { x: 1100, y: 13800 },
    { x: 10700, y: 13800 },
  ],
  [
    { x: 4000, y: 4000 },
    { x: 10900, y: 10900 },
  ],
  [
    { x: 4200, y: 1100 },
    { x: 13800, y: 1100 },
    { x: 13800, y: 10700 },
  ],
];
const RIVIERE: MapPoint[] = [
  { x: 1200, y: 13700 },
  { x: 13700, y: 1200 },
];
const FOSSES: MapPoint[] = [
  { x: 5007, y: 10471 },
  { x: 9866, y: 4414 },
];

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
    document.fonts?.ready.then(() => actif && setPolicesPretes(true));
    return () => {
      actif = false;
    };
  }, []);

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
    const echelle = size / MAP_SIZE;
    const ecran = (point: MapPoint) => toScreen(point, size);
    const trace = (points: MapPoint[]) => {
      ctx.beginPath();
      points.forEach((point, index) => {
        const { x, y } = ecran(point);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    };

    ctx.fillStyle = map.jungle;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = map.grid;
    ctx.lineWidth = 1;
    for (let pas = 1000; pas < MAP_SIZE; pas += 1000) {
      const p = pas * echelle;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, size);
      ctx.moveTo(0, size - p);
      ctx.lineTo(size, size - p);
      ctx.stroke();
    }

    ctx.fillStyle = map.blueBase;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.arc(0, size, RAYON_BASE * echelle, -Math.PI / 2, 0);
    ctx.fill();
    ctx.fillStyle = map.redBase;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.arc(size, 0, RAYON_BASE * echelle, Math.PI / 2, Math.PI);
    ctx.fill();

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = map.river;
    ctx.lineWidth = LARGEUR_RIVIERE * echelle;
    trace(RIVIERE);
    ctx.stroke();
    ctx.fillStyle = map.river;
    for (const fosse of FOSSES) {
      const { x, y } = ecran(fosse);
      ctx.beginPath();
      ctx.arc(x, y, 900 * echelle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = map.lane;
    ctx.lineWidth = LARGEUR_COULOIR * echelle;
    for (const couloir of COULOIRS) {
      trace(couloir);
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

    ctx.setLineDash([6, 4]);
    ctx.fillStyle = chart.markSoft;
    ctx.strokeStyle = chart.mark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pa.x, pa.y, radius * echelle, 0, Math.PI * 2);
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
      return brut;
    }
    const aimante = snapTo(brut, landmarks, size, AIMANT_PX);
    return { x: aimante.x, y: aimante.y };
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
