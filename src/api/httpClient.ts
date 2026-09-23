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

interface SessionListeners {
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
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
