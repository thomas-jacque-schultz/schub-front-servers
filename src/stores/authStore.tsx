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
import type { AuthenticatedUser } from "../types/auth";

const TOKEN_STORAGE_KEY = "botfront_access_token";

interface AuthStoreValue {
  accessToken: string;
  profile: AuthenticatedUser | null;
  connected: boolean;
  isAdmin: boolean;
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

    checkSession();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const value = useMemo<AuthStoreValue>(
    () => ({
      accessToken,
      profile,
      connected: Boolean(accessToken && profile),
      isAdmin: Boolean(profile?.roles?.some((role) => role === "ROLE_ADMIN" || role === "ADMIN")),
      isCheckingSession,
      isSubmitting,
      error,
      login,
      logout,
      clearError,
    }),
    [accessToken, profile, isCheckingSession, isSubmitting, error, login, logout, clearError],
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
