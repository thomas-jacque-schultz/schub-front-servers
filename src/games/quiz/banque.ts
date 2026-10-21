import type { Schemas } from "../../common";
import fichier from "./banque.json";
import type { QuestionBanque, Theme } from "./questions";

type QuestionLue = Schemas["QuizQuestionDto"];

export const BANQUE_FICHIER = fichier as QuestionBanque[];

const versBanque = (q: QuestionLue): QuestionBanque => ({
  id: q.id,
  theme: q.theme.toLowerCase() as Theme,
  date: q.date,
  source: q.source,
  fr: q.fr,
  en: q.en,
});

/** La banque du cœur (Schub#137), relue à chaque partie ; le fichier écrit pour #136 sert de secours. */
export const lisBanque = async (): Promise<QuestionBanque[]> => {
  try {
    const reponse = await fetch("/api/quiz/questions");
    if (!reponse.ok) {
      return BANQUE_FICHIER;
    }
    const lues = (await reponse.json()) as QuestionLue[];
    return lues.length > 0 ? lues.map(versBanque) : BANQUE_FICHIER;
  } catch {
    return BANQUE_FICHIER;
  }
};
