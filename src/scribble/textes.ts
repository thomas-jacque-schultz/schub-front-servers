import { traduction } from "../commun/textes";

export const texte = traduction({
  fr: {
    titre: "Scribble",
    effacer: "Effacer le tableau",
    epaisseur: "Épaisseur",
    choisisMot: "Choisis le champion à dessiner",
    choisitMot: "{nom} choisit un champion…",
    dessine: "Dessine : {mot}",
    dessinateur: "dessine",
    tours: "Nombre de tours",
    tour: "Tour {n}/{total}",
    gomme: "Gomme",
    recap: "Fin du tour",
  },
  en: {
    titre: "Scribble",
    effacer: "Clear the board",
    epaisseur: "Width",
    choisisMot: "Pick the champion to draw",
    choisitMot: "{nom} is picking a champion…",
    dessine: "Draw: {mot}",
    dessinateur: "drawing",
    tours: "Number of rounds",
    tour: "Round {n}/{total}",
    gomme: "Eraser",
    recap: "End of the round",
  },
});
