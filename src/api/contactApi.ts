import { requestJson } from "./httpClient";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  website: string;
  turnstileToken?: string;
}

export interface ContactAck {
  delivered: boolean;
}

export const sendContactMessageApi = async (payload: ContactMessage): Promise<ContactAck> =>
  requestJson<ContactAck>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
