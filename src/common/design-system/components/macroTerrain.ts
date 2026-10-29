import { terrainAt } from "./macroMap";

// La minimap de Riot, découpée en zones et repeinte aux couleurs du site (Macro Planner).
export interface Masques {
  sol: HTMLCanvasElement;
  riviere: HTMLCanvasElement;
  baseBleue: HTMLCanvasElement;
  baseRouge: HTMLCanvasElement;
}

// Un masque par zone, en blanc : son alpha dit la part du pixel qui appartient à la zone.
export const masquesDe = (image: HTMLImageElement): Masques => {
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

export const peindre = (
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
