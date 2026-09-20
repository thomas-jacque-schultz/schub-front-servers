const DEFAULT_API_BASE_URL = "/api";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Ce que le client HTTP signale à la session, sans la connaître.
 *
 * <p>C'est volontairement un point d'abonnement et non un import du store : `httpClient` est la
 * couche la plus basse, et lui faire connaître React ferait de chaque appel d'API une dépendance
 * au cycle de vie des composants.</p>
 *
 * <p>Il n'y a **plus de rappel de renouvellement** depuis le lot A.3. Le BFF réémettait le jeton
 * dans un en-tête `X-Auth-Token` que ce fichier lisait pour le ranger en `localStorage` ; le
 * jeton vivant désormais dans un cookie `httpOnly`, le serveur le repose lui-même par
 * `Set-Cookie` et le front n'a rien à orchestrer. Lire l'en-tête n'aurait servi qu'à recopier
 * une valeur que plus personne n'envoie (plan §A.2, décisions n°3 et n°4).</p>
 */
interface SessionListeners {
  /** Le cookie n'est plus accepté : il faut déconnecter proprement, pas laisser un écran mort. */
  onUnauthorized?: () => void;
}

let sessionListeners: SessionListeners = {};

export const configureSessionListeners = (listeners: SessionListeners): (() => void) => {
  sessionListeners = listeners;
  return () => {
    sessionListeners = {};
  };
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

/**
 * L'URL complète d'une route de l'API.
 *
 * <p>Exportée parce que toutes les navigations vers l'API ne passent pas par `fetch` :
 * `GET /auth/discord` est une **redirection de navigateur** et s'atteint par
 * `window.location.assign`. Le calcul du chemin doit rester le même pour les deux, sans quoi le
 * bouton Discord marcherait en production et pas derrière un `VITE_API_BASE_URL` de dev.</p>
 */
export const apiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = trimTrailingSlash(API_BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

export const requestJson = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(apiUrl(path), {
    ...options,
    // Le cookie de session est `httpOnly` : le front ne le lit pas, ne le stocke pas et ne le
    // pose pas — il demande seulement au navigateur de le joindre. En pratique le front et le
    // BFF partagent l'origine (nginx relaie `/api/`), et `same-origin` suffirait ; `include` est
    // explicite pour que le comportement ne dépende pas de la valeur de `VITE_API_BASE_URL`.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 401 : le cookie a expiré, a été effacé ou n'a jamais été posé. On prévient la session pour
    // qu'elle se ferme franchement — un écran qui reste affiché avec des boutons qui échouent
    // silencieusement coûte plus cher à comprendre qu'un retour à l'écran de connexion.
    if (response.status === 401) {
      sessionListeners.onUnauthorized?.();
    }

    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : "Une erreur est survenue";
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
};
