import { requestJson } from "../api/httpClient";

export const CONTACT_SUBJECTS = [
  "ACCOUNT",
  "WRONG_STATS",
  "FEATURE",
  "MINI_GAMES",
  "OTHER",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export interface ContactMessage {
  subject: ContactSubject;
  name: string;
  email: string;
  message: string;
  website: string;
  turnstileToken?: string;
}

export interface ContactAck {
  delivered: boolean;
}

export const sendContactMessageApi = async (
  payload: ContactMessage,
): Promise<ContactAck> =>
  requestJson<ContactAck>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
