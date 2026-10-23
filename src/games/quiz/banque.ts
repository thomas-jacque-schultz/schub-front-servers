import type { Schemas } from "../../common";
import type { QuestionBanque, Theme } from "./questions";

type QuestionLue = Schemas["QuizQuestionDto"];

const versBanque = (q: QuestionLue): QuestionBanque => ({
  id: q.id,
  theme: q.theme.toLowerCase() as Theme,
  date: q.date,
  source: q.source,
  image: q.image ?? null,
  imagesChoix: q.imagesChoix ?? null,
  fr: q.fr,
  en: q.en,
});

/** Les fichiers versés dans la banque (V028, V029 du cœur), chargés seulement si le cœur ne répond pas. */
const fichiers = async (): Promise<QuestionBanque[]> => {
  const [ecrites, fabriquees] = await Promise.all([
    import("./banque.json"),
    import("./fabriquees.json"),
  ]);
  return [
    ...(ecrites.default as QuestionBanque[]),
    ...(fabriquees.default as QuestionBanque[]),
  ];
};

/** La banque du cœur (Schub#137), relue à chaque partie. */
export const lisBanque = async (): Promise<QuestionBanque[]> => {
  try {
    const reponse = await fetch("/api/quiz/questions");
    if (!reponse.ok) {
      return fichiers();
    }
    const lues = (await reponse.json()) as QuestionLue[];
    return lues.length > 0 ? lues.map(versBanque) : fichiers();
  } catch {
    return fichiers();
  }
};
