// Le joueur, gardé dans le navigateur : son identifiant retrouve sa place après un rechargement.
const CLE_ID = "canvas-games.player-id";
const CLE_NOM = "canvas-games.player-name";

const lit = (cle: string): string | null => {
  try {
    return localStorage.getItem(cle);
  } catch {
    return null;
  }
};

const ecrit = (cle: string, valeur: string) => {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    // Navigation privée : le joueur redonnera son pseudo au prochain chargement.
  }
};

export const playerId = (): string => {
  const connu = lit(CLE_ID);
  if (connu) {
    return connu;
  }
  // getRandomValues plutôt que randomUUID, réservé aux pages en HTTPS.
  const neuf = Array.from(crypto.getRandomValues(new Uint8Array(16)), (octet) =>
    octet.toString(16).padStart(2, "0"),
  ).join("");
  ecrit(CLE_ID, neuf);
  return neuf;
};

export const playerName = (): string | null => lit(CLE_NOM);

export const rememberName = (nom: string) => ecrit(CLE_NOM, nom);
