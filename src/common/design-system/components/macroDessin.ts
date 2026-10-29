import { radiusOnScreen, toScreen, type MapPoint } from "./macroMap";
import type { MacroColor, MacroCursor, MacroShape } from "./MacroMap";
import { typographyTokens } from "../tokens";

export interface Pinceau {
  ctx: CanvasRenderingContext2D;
  size: number;
  teinte: (couleur: MacroColor) => string;
  papier: string;
  texte: string;
  /** L'image déjà chargée, sinon null : la carte se redessine à son arrivée. */
  image: (src: string) => HTMLImageElement | null;
}

const tailleIcone = (size: number) => Math.min(36, Math.max(22, size * 0.045));

/** Les formes du Macro Planner et les curseurs des autres, par-dessus le terrain. */
export function dessineFormes(
  { ctx, size, teinte, papier, texte, image }: Pinceau,
  shapes: readonly MacroShape[],
  cursors: readonly MacroCursor[],
) {
  const ecran = (point: MapPoint) => toScreen(point, size);
  const epaisseur = (largeur: number) => Math.max(1.5, largeur * size);
  const mono = typographyTokens.monospaceFontFamily;
  const etiquette = (texte: string, x: number, y: number, police: string) => {
    ctx.font = police;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const largeur = ctx.measureText(texte).width + 10;
    const mx = Math.min(size - largeur / 2, Math.max(largeur / 2, x));
    const my = Math.min(size - 10, Math.max(10, y));
    ctx.fillStyle = papier;
    ctx.fillRect(mx - largeur / 2, my - 10, largeur, 20);
    ctx.fillStyle = texte;
    ctx.fillText(texte, mx, my + 1);
  };

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
        ctx.strokeStyle = papier;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = `700 13px ${mono}`;
        ctx.fillStyle = texte;
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
          ctx.fillStyle = papier;
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
        ctx.strokeStyle = texte;
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
    ctx.strokeStyle = papier;
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
    ctx.fillStyle = papier;
    ctx.fillText(autre.name, p.x + 16, p.y + 14);
  }
}
