export type Lang = "fr" | "en";

export type Valeurs = Record<string, string | number>;

// Les textes de tous les jeux : le salon, les réglages, les devinettes et les scores.
const COMMUNS = {
  fr: {
    pseudoInvite: "Ton pseudo pour ce salon",
    rejoindre: "Entrer",
    connexion: "Connexion au salon…",
    reconnexion: "Connexion perdue, on réessaie…",
    joueurs: "Joueurs",
    meneur: "mène",
    copier: "Copier le lien",
    copie: "Lien copié",
    erreur_ROOM_NOT_FOUND: "Ce salon n'existe plus.",
    erreur_ROOM_FULL: "Ce salon est plein (10 joueurs).",
    erreur_TOO_MANY_ROOMS:
      "Trop de salons ouverts en ce moment, réessaie dans quelques minutes.",
    erreur_RATE_LIMITED:
      "Trop de salons créés depuis ta connexion, réessaie plus tard.",
    erreur_ROOM_EXPIRED: "Le salon a fermé après trente minutes sans activité.",
    erreur_REPLACED: "Ce salon est ouvert dans un autre onglet.",
    erreur_INVALID: "Le salon n'a pas compris la demande.",
    nouveau: "Nouveau salon",
    duree: "Durée d'une manche",
    secondes: "{n} s",
    lancer: "Lancer la partie",
    attenteMeneur: "Le meneur lance la partie quand tout le monde est là.",
    attenteJoueurs: "Il faut au moins deux joueurs pour lancer une partie.",
    trouveMoi: "Trouvé ! C'était {mot}",
    cetait: "C'était : {mot}",
    reponse: "Ta réponse",
    proposer: "Proposer",
    proche: "Presque !",
    aTrouve: "{nom} a trouvé !",
    scores: "Scores",
    reponses: "Réponses",
    points: "{n} pts",
    recap: "Fin de la partie",
    rejouer: "Rejouer",
    recapAttente: "Le meneur peut relancer une partie.",
    erreurMots: "Impossible de charger les champions, réessaie.",
    chrono: "Temps restant",
    ligne: "{nom} : {texte}",
  },
  en: {
    pseudoInvite: "Your nickname for this room",
    rejoindre: "Join",
    connexion: "Joining the room…",
    reconnexion: "Connection lost, retrying…",
    joueurs: "Players",
    meneur: "leads",
    copier: "Copy link",
    copie: "Link copied",
    erreur_ROOM_NOT_FOUND: "This room no longer exists.",
    erreur_ROOM_FULL: "This room is full (10 players).",
    erreur_TOO_MANY_ROOMS:
      "Too many rooms open right now, try again in a few minutes.",
    erreur_RATE_LIMITED:
      "Too many rooms created from your connection, try again later.",
    erreur_ROOM_EXPIRED:
      "The room closed after thirty minutes without activity.",
    erreur_REPLACED: "This room is open in another tab.",
    erreur_INVALID: "The room did not understand the request.",
    nouveau: "New room",
    duree: "Round length",
    secondes: "{n} s",
    lancer: "Start the game",
    attenteMeneur: "The leader starts the game once everyone is here.",
    attenteJoueurs: "You need at least two players to start a game.",
    trouveMoi: "Got it! It was {mot}",
    cetait: "It was: {mot}",
    reponse: "Your guess",
    proposer: "Guess",
    proche: "So close!",
    aTrouve: "{nom} got it!",
    scores: "Scores",
    reponses: "Guesses",
    points: "{n} pts",
    recap: "End of the game",
    rejouer: "Play again",
    recapAttente: "The leader can start a new game.",
    erreurMots: "Could not load the champions, try again.",
    chrono: "Time left",
    ligne: "{nom}: {texte}",
  },
};

export type CleCommune = keyof (typeof COMMUNS)["fr"];

const remplace = (gabarit: string, valeurs: Valeurs) =>
  gabarit.replace(/\{(\w+)\}/g, (tout, nom: string) =>
    nom in valeurs ? String(valeurs[nom]) : tout,
  );

export const texteCommun = (
  lang: Lang,
  cle: CleCommune,
  valeurs: Valeurs = {},
): string => remplace(COMMUNS[lang][cle], valeurs);

/** Les textes d'un jeu, par-dessus les textes communs. */
export const traduction =
  <T extends Record<string, string>>(propres: {
    fr: T;
    en: Record<keyof T, string>;
  }) =>
  (lang: Lang, cle: keyof T | CleCommune, valeurs: Valeurs = {}): string =>
    remplace(
      (propres[lang] as Record<string, string>)[cle as string] ??
        COMMUNS[lang][cle as CleCommune],
      valeurs,
    );

export const langueDuNavigateur = (): Lang =>
  navigator.language?.startsWith("fr") ? "fr" : "en";
