import type { Schemas } from "../../common";
import { requestJson } from "../../common";

export type QuizQuestionDto = Schemas["QuizQuestionDto"];

export type QuizQuestionRequest = Schemas["QuizQuestionRequest"];

const base = "/quiz/questions";

export const getAllQuizQuestionsApi = async (): Promise<QuizQuestionDto[]> =>
  requestJson<QuizQuestionDto[]>(`${base}/all`, { method: "GET" });

export const saveQuizQuestionApi = async (
  id: string,
  request: QuizQuestionRequest,
): Promise<QuizQuestionDto> =>
  requestJson<QuizQuestionDto>(`${base}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
