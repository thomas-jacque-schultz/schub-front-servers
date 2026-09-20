import { requestJson } from "./httpClient";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /**
   * Le champ leurre — **il doit rester vide**.
   *
   * <p>Il est présent dans le formulaire, masqué à l'œil et retiré de l'ordre de tabulation.
   * Un humain ne le voit pas ; un robot qui remplit tout ce qu'il trouve le remplit. Le BFF
   * rejette alors la requête. C'est la couche anti-spam la moins chère, et celle qui attrape le
   * plus de trafic automatisé aveugle.</p>
   */
  website: string;
  /** Le jeton Turnstile, quand la clé publique est configurée. Absent, le BFF n'en exige pas. */
  turnstileToken?: string;
}

export interface ContactAck {
  /** Vrai quand le message a été remis — par message privé ou par le salon de repli. */
  delivered: boolean;
}

/**
 * Le formulaire de contact.
 *
 * <p>Route **publique** : aucun jeton n'est envoyé, et c'est précisément ce qui impose les trois
 * couches anti-spam décrites au §4 du plan. Le front n'en porte que deux (le leurre et le jeton
 * Turnstile) ; la limitation de débit par IP est au BFF, où elle ne se contourne pas.</p>
 */
export const sendContactMessageApi = async (payload: ContactMessage): Promise<ContactAck> =>
  requestJson<ContactAck>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
