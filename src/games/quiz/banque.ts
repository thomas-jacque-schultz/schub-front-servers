import fichier from "./banque.json";
import type { QuestionBanque } from "./questions";

export const BANQUE_FICHIER = fichier as QuestionBanque[];

export const lisBanque = async (): Promise<QuestionBanque[]> => BANQUE_FICHIER;
