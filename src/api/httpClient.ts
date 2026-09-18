const DEFAULT_API_BASE_URL = "/api";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  DEFAULT_API_BASE_URL;

/**
 * L'en-tête par lequel le BFF repose un jeton frais.
 *
 * <p>Le jeton ne vit plus qu'un quart d'heure (décision n°3 du 18-09) et le BFF le **réémet**
 * dès qu'il lui reste moins de la moitié de sa vie. Sans cette lecture, une session active
 * expirerait toutes les quinze minutes alors que le serveur a déjà tendu le renouvellement.</p>
 *
 * <p>Provisoire : au lot A.3 le jeton passe en cookie `httpOnly` et le serveur le reposera
 * lui-même. Le transport ne change pas ici — on reste en `Authorization: Bearer`.</p>
 */
export const RENEWED_TOKEN_HEADER = "X-Auth-Token";

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
 */
interface SessionListeners {
  /** Le BFF a reposé un jeton : la session doit le prendre, sinon elle expirera pour rien. */
  onTokenRenewed?: (token: string) => void;
  /** Le jeton n'est plus accepté : il faut déconnecter proprement, pas laisser un écran mort. */
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

const buildUrl = (path: string): string => {
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
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const renewedToken = response.headers.get(RENEWED_TOKEN_HEADER);
  if (renewedToken) {
    sessionListeners.onTokenRenewed?.(renewedToken);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // 401 : le jeton a expiré ou a été révoqué. On prévient la session pour qu'elle se ferme
    // franchement — un écran qui reste affiché avec des boutons qui échouent silencieusement
    // coûte plus cher à comprendre qu'un retour à l'écran de connexion.
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
