// La juste mesure (Schub#174) : le portrait de chaque champion de tailles.json, tiré de son modèle 3D et de ses textures.
//   npm run mesure:portraits [-- Teemo Darius]   écrit public/premadelab/mesure/<id>.png
// Community Dragon sert les modèles et les textures, plus les squelettes ni les animations : la pose reste celle du modèle.
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
const PALIER = 12;
const ECLAIRCI = 0.78;
const EPAISSEUR_LISERE = 3;
const CLAIR = [240, 230, 214];
const ENCRE = [22, 14, 28];
// De trois quarts : de face, un modèle aux bras écartés se lit mal.
const LACET = (22 * Math.PI) / 180;
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
  const uv = new Float32Array(nbSommets * 2);
  for (let i = 0; i < nbSommets; i++) {
    const debut = p + i * tailleSommet;
    for (let a = 0; a < 3; a++) {
      positions[i * 3 + a] = vue.getFloat32(debut + a * 4, true);
      normales[i * 3 + a] = vue.getFloat32(debut + 32 + a * 4, true);
    }
    uv[i * 2] = vue.getFloat32(debut + 44, true);
    uv[i * 2 + 1] = vue.getFloat32(debut + 48, true);
  }
  if (morceaux.length === 0) {
    morceaux.push({ nom: "", premierSommet: 0, sommets: nbSommets, premierIndice: 0, indices: nbIndices });
  }
  return { morceaux, indices, positions, normales, uv };
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

const tourne = ({ positions, normales }) => {
  const c = Math.cos(LACET), s = Math.sin(LACET);
  for (const v of [positions, normales]) {
    for (let i = 0; i + 2 < v.length; i += 3) {
      const x = v[i], z = v[i + 2];
      v[i] = c * x + s * z;
      v[i + 2] = c * z - s * x;
    }
  }
};

// Un PNG non entrelacé de 8 bits par canal, en RVB ou RVBA : ce que Community Dragon tire des textures du jeu.
const lisPng = (buffer) => {
  const largeur = buffer.readUInt32BE(16), hauteur = buffer.readUInt32BE(20);
  const canaux = { 2: 3, 6: 4 }[buffer[25]];
  if (buffer[24] !== 8 || !canaux || buffer[28] !== 0) {
    throw new Error("PNG non géré");
  }
  const morceaux = [];
  for (let p = 8; p < buffer.length; ) {
    const longueur = buffer.readUInt32BE(p);
    if (buffer.toString("latin1", p + 4, p + 8) === "IDAT") {
      morceaux.push(buffer.subarray(p + 8, p + 8 + longueur));
    }
    p += 12 + longueur;
  }
  const brut = zlib.inflateSync(Buffer.concat(morceaux));
  const ligne = largeur * canaux;
  const px = Buffer.alloc(ligne * hauteur);
  for (let y = 0; y < hauteur; y++) {
    const filtre = brut[y * (ligne + 1)];
    for (let i = 0; i < ligne; i++) {
      const a = i >= canaux ? px[y * ligne + i - canaux] : 0;
      const b = y > 0 ? px[(y - 1) * ligne + i] : 0;
      const c = i >= canaux && y > 0 ? px[(y - 1) * ligne + i - canaux] : 0;
      const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
      const predit = [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][filtre];
      px[y * ligne + i] = (brut[y * (ligne + 1) + 1 + i] + predit) & 255;
    }
  }
  return { px, largeur, hauteur, canaux };
};

const texel = (t, u, v, sortie) => {
  const x = Math.min(t.largeur - 1, Math.floor((u - Math.floor(u)) * t.largeur));
  const y = Math.min(t.hauteur - 1, Math.floor((v - Math.floor(v)) * t.hauteur));
  const i = (y * t.largeur + x) * t.canaux;
  sortie[0] = t.px[i];
  sortie[1] = t.px[i + 1];
  sortie[2] = t.px[i + 2];
};

// Sans perspective : à chaque pixel, la profondeur et la couleur de la texture, nuancée par la lumière.
const rasterise = (modele, triangles, textures, b, l, h) => {
  const echelle = l / (b.x1 - b.x0);
  const profondeur = new Float32Array(l * h).fill(-Infinity);
  const couleur = new Uint8Array(l * h * 3);
  const { positions: P, normales: N, uv: UV, morceauDe } = modele;
  const LX = -0.35, LY = 0.55, LZ = 0.76;
  const rvb = [0, 0, 0];
  for (let t = 0; t + 2 < triangles.length; t += 3) {
    const sa = triangles[t], sc = triangles[t + 1], sd = triangles[t + 2];
    const a = sa * 3, c = sc * 3, d = sd * 3;
    const texture = textures[morceauDe[sa]];
    const ax = (P[a] - b.x0) * echelle, ay = (b.y1 - P[a + 1]) * echelle;
    const cx = (P[c] - b.x0) * echelle, cy = (b.y1 - P[c + 1]) * echelle;
    const dx = (P[d] - b.x0) * echelle, dy = (b.y1 - P[d + 1]) * echelle;
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
        const lumiere = Math.max(0, (nx * LX + ny * LY + nz * LZ) / norme);
        // Les textures du jeu ont déjà leurs ombres peintes : la lumière ne fait que les relever.
        const nuance = 0.82 + 0.3 * lumiere;
        if (texture) {
          texel(texture, u * UV[sa * 2] + v * UV[sc * 2] + w * UV[sd * 2], u * UV[sa * 2 + 1] + v * UV[sc * 2 + 1] + w * UV[sd * 2 + 1], rvb);
        } else {
          rvb.fill(170);
        }
        for (let k = 0; k < 3; k++) {
          couleur[i * 3 + k] = Math.min(255, 255 * Math.pow(rvb[k] / 255, ECLAIRCI) * nuance);
        }
      }
    }
  }
  return { profondeur, couleur, echelle };
};

// Un liseré clair, comme un autocollant : un champion sombre se détache ainsi du fond des jeux, sombre lui aussi. À
// l'intérieur, un trait d'encre sur les ruptures de profondeur.
const liseres = ({ profondeur, couleur, echelle }, l, h) => {
  const seuil = 6 / SURECHANTILLON;
  const vide = (x, y) => x < 0 || y < 0 || x >= l || y >= h || profondeur[y * l + x] === -Infinity;
  const peint = (i, [r, v, b]) => {
    couleur[i * 3] = r;
    couleur[i * 3 + 1] = v;
    couleur[i * 3 + 2] = b;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < l; x++) {
      if (vide(x, y)) {
        continue;
      }
      const i = y * l + x;
      let bord = false;
      for (let dy = -EPAISSEUR_LISERE; dy <= EPAISSEUR_LISERE && !bord; dy++) {
        for (let dx = -EPAISSEUR_LISERE; dx <= EPAISSEUR_LISERE && !bord; dx++) {
          bord = dx * dx + dy * dy <= EPAISSEUR_LISERE * EPAISSEUR_LISERE && vide(x + dx, y + dy);
        }
      }
      if (bord) {
        peint(i, CLAIR);
      } else if (
        [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([ex, ey]) => (profondeur[i] - profondeur[(y + ey) * l + x + ex]) * echelle > seuil)
      ) {
        peint(i, ENCRE);
      }
    }
  }
  return { profondeur, couleur };
};

const reduit = ({ profondeur, couleur }, l, h, f) => {
  const L = Math.floor(l / f), H = Math.floor(h / f);
  const sortie = Buffer.alloc((L * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    const ligne = y * (L * 4 + 1);
    for (let x = 0; x < L; x++) {
      const somme = [0, 0, 0];
      let opaque = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const i = (y * f + dy) * l + x * f + dx;
          if (profondeur[i] !== -Infinity) {
            for (let k = 0; k < 3; k++) {
              somme[k] += couleur[i * 3 + k];
            }
            opaque++;
          }
        }
      }
      for (let k = 0; k < 3; k++) {
        // Des paliers de couleur : le fichier en sort trois à quatre fois plus léger, sans que l'œil le voie à cette taille.
        sortie[ligne + 1 + x * 4 + k] = opaque ? Math.min(255, Math.round(somme[k] / opaque / PALIER) * PALIER) : 0;
      }
      sortie[ligne + 4 + x * 4] = Math.round((opaque * 255) / (f * f));
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

// RVBA (type 6), 8 bits.
const png = ({ donnees, largeur, hauteur }) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largeur, 0);
  ihdr.writeUInt32BE(hauteur, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceauPng("IHDR", ihdr),
    morceauPng("IDAT", zlib.deflateSync(donnees, { level: 9 })),
    morceauPng("IEND", Buffer.alloc(0)),
  ]);
};

const octets = async (url) => {
  const reponse = await fetch(url);
  if (!reponse.ok) {
    throw new Error(`${reponse.status} ${url}`);
  }
  return Buffer.from(await reponse.arrayBuffer());
};

// Un morceau prend sa texture dans materialOverride, sinon celle du skin, écrite directement ou dans un matériau du .bin.
const textureDuMateriau = (skin, nom) => {
  const echantillons = skin[nom]?.samplerValues ?? [];
  return (
    echantillons.find((e) => e.TextureName === "Main_Texture") ??
    echantillons.find((e) => /diffuse/i.test(e.TextureName ?? ""))
  )?.texturePath;
};

const cheminTexture = (skin, source) =>
  source?.texture ?? (source?.Material ? textureDuMateriau(skin, source.Material) : undefined);

const charge = new Map();
const litTexture = async (chemin) => {
  if (!chemin) {
    return null;
  }
  const url = `${DRAGON}/${chemin.toLowerCase().replace(/\.(tex|dds)$/, ".png")}`;
  if (!charge.has(url)) {
    charge.set(url, await octets(url).then(lisPng).catch(() => null));
  }
  return charge.get(url);
};

// Ce matériau-là vit dans un autre .bin que le skin.
const TEXTURE_AILLEURS = { Evelynn: "assets/characters/evelynn/skins/base/evelynn_base_cm_tx3_v03.tex" };

const traite = async (id) => {
  const dossier = id.toLowerCase();
  const skin = await json(`${DRAGON}/data/characters/${dossier}/skins/skin0.bin.json`);
  const proprietes = proprietesDuSkin(skin);
  const modele = lisSkn(await octets(`${DRAGON}/${proprietes.simpleSkin.toLowerCase()}`));
  const masques = caches(proprietes);
  const visibles = modele.morceaux.filter((m) => !masques.has(m.nom.toLowerCase()));
  const parMorceau = new Map(
    (proprietes.materialOverride ?? []).map((o) => [o.submesh?.toLowerCase(), o]),
  );
  charge.clear();
  const textures = await Promise.all(
    modele.morceaux.map((m) =>
      litTexture(cheminTexture(skin, parMorceau.get(m.nom.toLowerCase())) ?? cheminTexture(skin, proprietes) ?? TEXTURE_AILLEURS[id]),
    ),
  );
  const sansTexture = visibles.filter((m) => !textures[modele.morceaux.indexOf(m)]).map((m) => m.nom);
  modele.morceauDe = new Int16Array(modele.positions.length / 3);
  modele.morceaux.forEach((m, n) => modele.morceauDe.fill(n, m.premierSommet, m.premierSommet + m.sommets));
  const triangles = corps(modele, visibles);
  tourne(modele);
  const b = bornesDe(modele.positions, triangles);
  const largeurModele = b.x1 - b.x0;
  const hauteurModele = b.y1 - b.y0;
  const parUnite = COTE_MAX / Math.max(largeurModele, hauteurModele);
  const l = Math.max(1, Math.round(largeurModele * parUnite)) * SURECHANTILLON;
  const h = Math.max(1, Math.round(hauteurModele * parUnite)) * SURECHANTILLON;
  const image = reduit(liseres(rasterise(modele, triangles, textures, b, l, h), l, h), l, h, SURECHANTILLON);
  fs.writeFileSync(path.join(SORTIE, `${id}.png`), png(image));
  return sansTexture;
};

const demandes = process.argv.slice(2);
const ids = demandes.length > 0 ? demandes : Object.keys(JSON.parse(fs.readFileSync(TAILLES, "utf8")));
fs.mkdirSync(SORTIE, { recursive: true });
let echecs = 0;
for (const id of ids) {
  try {
    const sansTexture = await traite(id);
    console.log(id, sansTexture.length > 0 ? `sans texture : ${sansTexture.join(", ")}` : "");
  } catch (erreur) {
    echecs++;
    console.error(`${id} : ${erreur.message}`);
  }
}
console.log(`${ids.length - echecs} portraits, ${echecs} échecs`);
