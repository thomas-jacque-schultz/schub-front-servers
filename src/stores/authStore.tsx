import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import i18n from "../i18n";
import { getMeApi, loginApi } from "../api/authApi";
import { configureSessionListeners } from "../api/httpClient";
import type { AuthenticatedUser } from "../types/auth";
import type { Permission } from "../types/permission";

const TOKEN_STORAGE_KEY = "botfront_access_token";

interface AuthStoreValue {
  accessToken: string;
  profile: AuthenticatedUser | null;
  connected: boolean;
  /** Les permissions du rôle de l'acteur, telles que le jeton les porte. */
  permissions: Permission[];
  /**
   * Le test de droit de l'interface.
   *
   * <p>Il remplace l'ancien `isAdmin`, qui comparait une chaîne de rôle : un rôle est éditable
   * en base depuis le lot A.1, donc son nom ne dit plus rien de ce qu'il permet. Une seule
   * fonction, à un seul endroit, plutôt qu'une comparaison recopiée dans chaque composant.</p>
   */
  can: (permission: Permission) => boolean;
  /** Vrai si l'acteur détient **au moins une** des permissions — pour une entrée de menu. */
  canAny: (...permissions: Permission[]) => boolean;
  isCheckingSession: boolean;
  isSubmitting: boolean;
  error: string;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthStoreContext = createContext<AuthStoreValue | undefined>(undefined);

export const AuthStoreProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string>(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  );
  const [profile, setProfile] = useState<AuthenticatedUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setAccessToken("");
    setProfile(null);
    setError("");
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginApi({ username, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      setAccessToken(response.accessToken);
      const me = await getMeApi(response.accessToken);
      setProfile(me);
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : i18n.t("errors.loginFailed", { ns: "auth" });
      setError(message);
      throw loginError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Les deux réactions au transport : le jeton reposé par le BFF, et le refus.
   *
   * <p>Un 401 ferme la session au lieu de laisser l'écran en place : sans ça, un jeton expiré
   * produit une page qui s'affiche normalement et dont chaque bouton échoue — l'état mort que le
   * raccourcissement du jeton à quinze minutes rendrait quotidien.</p>
   */
  useEffect(() => {
    return configureSessionListeners({
      onTokenRenewed: (token) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        setAccessToken((current) => (current === token ? current : token));
      },
      onUnauthorized: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAccessToken("");
        setProfile(null);
        setError(i18n.t("errors.sessionExpired", { ns: "auth" }));
      },
    });
  }, []);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      if (!accessToken) {
        if (active) {
          setProfile(null);
          setIsCheckingSession(false);
        }
        return;
      }

      try {
        const me = await getMeApi(accessToken);
        if (active) {
          setProfile(me);
        }
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (active) {
          setAccessToken("");
          setProfile(null);
        }
      } finally {
        if (active) {
          setIsCheckingSession(false);
        }
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const permissions = useMemo<Permission[]>(() => profile?.permissions ?? [], [profile]);

  const can = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  );

  const canAny = useCallback(
    (...candidates: Permission[]) => candidates.some((candidate) => permissions.includes(candidate)),
    [permissions],
  );

  const value = useMemo<AuthStoreValue>(
    () => ({
      accessToken,
      profile,
      connected: Boolean(accessToken && profile),
      permissions,
      can,
      canAny,
      isCheckingSession,
      isSubmitting,
      error,
      login,
      logout,
      clearError,
    }),
    [
      accessToken,
      profile,
      permissions,
      can,
      canAny,
      isCheckingSession,
      isSubmitting,
      error,
      login,
      logout,
      clearError,
    ],
  );

  return (
    <AuthStoreContext.Provider value={value}>{children}</AuthStoreContext.Provider>
  );
};

export const useAuthStore = (): AuthStoreValue => {
  const context = useContext(AuthStoreContext);
  if (!context) {
    throw new Error("useAuthStore must be used inside AuthStoreProvider");
  }

  return context;
};
