// La juste mesure (Schub#174) : un croquis de chaque champion, tiré de son modèle 3D, et sa taille réelle dans le jeu.
//   npm run mesure:silhouettes [-- Teemo Darius]   écrit public/premadelab/mesure/<id>.png et src/games/mesure/tailles.json
// Community Dragon sert les fichiers du jeu. Une taille = la hauteur du modèle au repos × skinScale du skin de base.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SORTIE = path.join(racine, "public/premadelab/mesure");
const TAILLES = path.join(racine, "src/games/mesure/tailles.json");
const DRAGON = "https://raw.communitydragon.org/latest/game";
const COTE_MAX = 420;
const SURECHANTILLON = 2;
// Relus à l'œil sur tout le roster : au repos, ceux-là ne ressemblent à rien, ou ne tiennent pas debout.
const ILLISIBLES = new Set(["Belveth", "Nami", "Nocturne", "Skarner", "Smolder", "Velkoz"]);
const SOUS_LE_SOL = 0.08;
const ECART_PIECES = 0.02;

const json = async (url) => {
  const reponse = await fetch(url);
  if (!reponse.ok) {
    throw new Error(`${reponse.status} ${url}`);
  }
  return reponse.json();
};

// Le format .skn : https://github.com/LeagueToolkit — sommets 52 octets, plus couleur (56) et tangente (72).
const lisSkn = (buffer) => {
  const vue = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let p = 0;
  const u16 = () => ((p += 2), vue.getUint16(p - 2, true));
  const u32 = () => ((p += 4), vue.getUint32(p - 4, true));
  if (u32() !== 0x00112233) {
    throw new Error("pas un .skn");
  }
  const majeure = u16();
  u16();
  const morceaux = [];
  if (majeure > 0) {
    const nombre = u32();
    for (let i = 0; i < nombre; i++) {
      const nom = buffer.toString("latin1", p, p + 64).replace(/\0.*$/, "");
      p += 64;
      const premierSommet = u32();
      const sommets = u32();
      const premierIndice = u32();
      const indices = u32();
      morceaux.push({ nom, premierSommet, sommets, premierIndice, indices });
    }
  }
  if (majeure >= 4) {
    u32();
  }
  const nbIndices = u32();
  const nbSommets = u32();
  let tailleSommet = 52;
  if (majeure >= 4) {
    tailleSommet = u32();
    u32();
    p += 40;
  }
  const indices = new Uint16Array(nbIndices);
  for (let i = 0; i < nbIndices; i++) {
    indices[i] = u16();
  }
  const positions = new Float32Array(nbSommets * 3);
  const normales = new Float32Array(nbSommets * 3);
  for (let i = 0; i < nbSommets; i++) {
    const debut = p + i * tailleSommet;
    for (let a = 0; a < 3; a++) {
      positions[i * 3 + a] = vue.getFloat32(debut + a * 4, true);
      normales[i * 3 + a] = vue.getFloat32(debut + 32 + a * 4, true);
    }
  }
  if (morceaux.length === 0) {
    morceaux.push({ nom: "", premierIndice: 0, indices: nbIndices });
  }
  return { morceaux, indices, positions, normales };
};

const proprietesDuSkin = (skin) => {
  const entree = Object.values(skin).find((valeur) => valeur?.skinMeshProperties);
  if (!entree) {
    throw new Error("skin sans modèle");
  }
  return entree.skinMeshProperties;
};

const caches = (proprietes) =>
  new Set(
    String(proprietes.initialSubmeshToHide ?? "")
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((nom) => nom.toLowerCase()),
  );

const bornesDe = (positions, triangles) => {
  const b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
  for (const sommet of triangles) {
    const s = sommet * 3;
    b.x0 = Math.min(b.x0, positions[s]);
    b.x1 = Math.max(b.x1, positions[s]);
    b.y0 = Math.min(b.y0, positions[s + 1]);
    b.y1 = Math.max(b.y1, positions[s + 1]);
  }
  return b;
};

// Au repos, une arme flotte à côté du corps ou traverse le sol (le marteau de Poppy, la hache de Darius), alors que le
// corps lui-même est souvent en plusieurs pièces. On écarte ce qui passe sous le sol (y = 0 dans le jeu), puis on garde
// le plus gros groupe de pièces dont les cadres se touchent.
const corps = (modele, visibles) => {
  const { positions: P, indices: I } = modele;
  const soudes = new Map();
  const parent = new Int32Array(P.length / 3).map((_, i) => i);
  const racine = (a) => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const relie = (a, b) => {
    parent[racine(a)] = racine(b);
  };
  const triangles = [];
  for (const morceau of visibles) {
    for (let t = morceau.premierIndice; t + 2 < morceau.premierIndice + morceau.indices; t += 3) {
      triangles.push(I[t], I[t + 1], I[t + 2]);
      relie(I[t], I[t + 1]);
      relie(I[t], I[t + 2]);
    }
  }
  // Une couture de texture dédouble les sommets : au même endroit, c'est la même pièce.
  for (const sommet of triangles) {
    const cle = `${P[sommet * 3].toFixed(2)},${P[sommet * 3 + 1].toFixed(2)},${P[sommet * 3 + 2].toFixed(2)}`;
    if (soudes.has(cle)) {
      relie(sommet, soudes.get(cle));
    } else {
      soudes.set(cle, sommet);
    }
  }
  const pieces = new Map();
  for (const sommet of triangles) {
    const r = racine(sommet);
    if (!pieces.has(r)) {
      pieces.set(r, []);
    }
    pieces.get(r).push(sommet);
  }
  const liste = [...pieces.values()].map((piece) => ({ piece, b: bornesDe(P, piece) }));
  const tout = bornesDe(P, triangles);
  const hauteur = tout.y1 - tout.y0;
  const hors = liste.filter(({ b }) => b.y0 >= -SOUS_LE_SOL * hauteur);
  const retenues = hors.length > 0 ? hors : liste;
  const marge = ECART_PIECES * hauteur;
  const touche = (a, b) =>
    a.x0 - marge <= b.x1 && b.x0 - marge <= a.x1 && a.y0 - marge <= b.y1 && b.y0 - marge <= a.y1;
  const groupe = new Int32Array(retenues.length).map((_, i) => i);
  const chef = (i) => (groupe[i] === i ? i : (groupe[i] = chef(groupe[i])));
  for (let i = 0; i < retenues.length; i++) {
    for (let j = i + 1; j < retenues.length; j++) {
      if (touche(retenues[i].b, retenues[j].b)) {
        groupe[chef(i)] = chef(j);
      }
    }
  }
  const poids = new Map();
  retenues.forEach(({ piece }, i) => poids.set(chef(i), (poids.get(chef(i)) ?? 0) + piece.length));
  const meilleur = [...poids.entries()].sort((a, b) => b[1] - a[1])[0][0];
  return retenues.flatMap(({ piece }, i) => (chef(i) === meilleur ? piece : []));
};

// Vue de face, sans perspective : la profondeur et la normale de chaque pixel, à un tampon de profondeur près.
const rasterise = (modele, triangles, b, l, h) => {
  const echelle = l / (b.x1 - b.x0);
  const profondeur = new Float32Array(l * h).fill(-Infinity);
  const lumiere = new Float32Array(l * h);
  const { positions: P, normales: N } = modele;
  const ecranX = (s) => (P[s] - b.x0) * echelle;
  const ecranY = (s) => (b.y1 - P[s + 1]) * echelle;
  const LX = -0.35, LY = 0.55, LZ = 0.76;
  {
    for (let t = 0; t + 2 < triangles.length; t += 3) {
      const a = triangles[t] * 3, c = triangles[t + 1] * 3, d = triangles[t + 2] * 3;
      const ax = ecranX(a), ay = ecranY(a), cx = ecranX(c), cy = ecranY(c), dx = ecranX(d), dy = ecranY(d);
      const aire = (cx - ax) * (dy - ay) - (cy - ay) * (dx - ax);
      if (aire === 0) {
        continue;
      }
      const x0 = Math.max(0, Math.floor(Math.min(ax, cx, dx)));
      const x1 = Math.min(l - 1, Math.ceil(Math.max(ax, cx, dx)));
      const y0 = Math.max(0, Math.floor(Math.min(ay, cy, dy)));
      const y1 = Math.min(h - 1, Math.ceil(Math.max(ay, cy, dy)));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          const u = ((cx - px) * (dy - py) - (cy - py) * (dx - px)) / aire;
          const v = ((dx - px) * (ay - py) - (dy - py) * (ax - px)) / aire;
          const w = 1 - u - v;
          if (u < 0 || v < 0 || w < 0) {
            continue;
          }
          const z = u * P[a + 2] + v * P[c + 2] + w * P[d + 2];
          const i = y * l + x;
          if (z <= profondeur[i]) {
            continue;
          }
          profondeur[i] = z;
          const nx = u * N[a] + v * N[c] + w * N[d];
          const ny = u * N[a + 1] + v * N[c + 1] + w * N[d + 1];
          const nz = u * N[a + 2] + v * N[c + 2] + w * N[d + 2];
          const norme = Math.hypot(nx, ny, nz) || 1;
          lumiere[i] = Math.max(0, (nx * LX + ny * LY + nz * LZ) / norme);
        }
      }
    }
  }
  return { profondeur, lumiere, echelle };
};

// Un crayonné : trois tons de papier, et un trait d'encre sur les contours et les ruptures de profondeur.
const croquis = ({ profondeur, lumiere, echelle }, l, h) => {
  const ton = new Uint8Array(l * h);
  const alpha = new Uint8Array(l * h);
  const seuil = 6 / SURECHANTILLON;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < l; x++) {
      const i = y * l + x;
      if (profondeur[i] === -Infinity) {
        continue;
      }
      alpha[i] = 255;
      let trait = false;
      for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const vx = x + ex, vy = y + ey;
        const voisin = vx < 0 || vy < 0 || vx >= l || vy >= h ? -Infinity : profondeur[vy * l + vx];
        if (voisin === -Infinity || (profondeur[i] - voisin) * echelle > seuil) {
          trait = true;
        }
      }
      ton[i] = trait ? 30 : lumiere[i] > 0.62 ? 235 : lumiere[i] > 0.3 ? 190 : 140;
    }
  }
  return { ton, alpha };
};

const reduit = ({ ton, alpha }, l, h, f) => {
  const L = Math.floor(l / f), H = Math.floor(h / f);
  const sortie = Buffer.alloc((L * 2 + 1) * H);
  for (let y = 0; y < H; y++) {
    const ligne = y * (L * 2 + 1);
    for (let x = 0; x < L; x++) {
      let somme = 0, opaque = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const i = (y * f + dy) * l + x * f + dx;
          if (alpha[i]) {
            somme += ton[i];
            opaque++;
          }
        }
      }
      sortie[ligne + 1 + x * 2] = opaque ? Math.round(somme / opaque / 16) * 16 : 0;
      sortie[ligne + 2 + x * 2] = Math.round((opaque * 255) / (f * f));
    }
  }
  return { donnees: sortie, largeur: L, hauteur: H };
};

const crc = (() => {
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return c >>> 0;
  });
  return (buffer) => {
    let c = 0xffffffff;
    for (const octet of buffer) {
      c = table[(c ^ octet) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  };
})();

const morceauPng = (type, donnees) => {
  const tete = Buffer.alloc(4);
  tete.writeUInt32BE(donnees.length);
  const corps = Buffer.concat([Buffer.from(type, "latin1"), donnees]);
  const fin = Buffer.alloc(4);
  fin.writeUInt32BE(crc(corps));
  return Buffer.concat([tete, corps, fin]);
};

// Niveaux de gris + alpha (type 4), 8 bits.
const png = ({ donnees, largeur, hauteur }) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largeur, 0);
  ihdr.writeUInt32BE(hauteur, 4);
  ihdr[8] = 8;
  ihdr[9] = 4;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceauPng("IHDR", ihdr),
    morceauPng("IDAT", zlib.deflateSync(donnees, { level: 9 })),
    morceauPng("IEND", Buffer.alloc(0)),
  ]);
};

const traite = async (id) => {
  const dossier = id.toLowerCase();
  const skin = await json(`${DRAGON}/data/characters/${dossier}/skins/skin0.bin.json`);
  const proprietes = proprietesDuSkin(skin);
  const reponse = await fetch(`${DRAGON}/${proprietes.simpleSkin.toLowerCase()}`);
  if (!reponse.ok) {
    throw new Error(`${reponse.status} ${proprietes.simpleSkin}`);
  }
  const modele = lisSkn(Buffer.from(await reponse.arrayBuffer()));
  const masques = caches(proprietes);
  const visibles = modele.morceaux.filter((m) => !masques.has(m.nom.toLowerCase()));
  const triangles = corps(modele, visibles);
  const b = bornesDe(modele.positions, triangles);
  const largeurModele = b.x1 - b.x0;
  const hauteurModele = b.y1 - b.y0;
  const parUnite = COTE_MAX / Math.max(largeurModele, hauteurModele);
  const l = Math.max(1, Math.round(largeurModele * parUnite)) * SURECHANTILLON;
  const h = Math.max(1, Math.round(hauteurModele * parUnite)) * SURECHANTILLON;
  const image = reduit(croquis(rasterise(modele, triangles, b, l, h), l, h), l, h, SURECHANTILLON);
  fs.writeFileSync(path.join(SORTIE, `${id}.png`), png(image));
  const echelle = proprietes.skinScale ?? 1;
  return {
    hauteur: Math.round(hauteurModele * echelle),
    largeur: Math.round(largeurModele * echelle),
  };
};

const versions = await json("https://ddragon.leagueoflegends.com/api/versions.json");
const catalogue = await json(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/en_US/champion.json`);
const demandes = process.argv.slice(2);
const ids = demandes.length > 0 ? demandes : Object.keys(catalogue.data).filter((id) => !ILLISIBLES.has(id)).sort();
fs.mkdirSync(SORTIE, { recursive: true });
fs.mkdirSync(path.dirname(TAILLES), { recursive: true });
const tailles = fs.existsSync(TAILLES) && demandes.length > 0 ? JSON.parse(fs.readFileSync(TAILLES, "utf8")) : {};
let echecs = 0;
for (const id of ids) {
  try {
    tailles[id] = await traite(id);
    console.log(id, tailles[id]);
  } catch (erreur) {
    echecs++;
    delete tailles[id];
    console.error(`${id} : ${erreur.message}`);
  }
}
fs.writeFileSync(TAILLES, `${JSON.stringify(Object.fromEntries(Object.entries(tailles).sort()), null, 0).replace(/},/g, "},\n")}\n`);
console.log(`${Object.keys(tailles).length} champions, ${echecs} échecs`);
