import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import i18n from "../i18n";
import { discordLoginUrl, getMeApi, logoutApi } from "../api/authApi";
import { configureSessionListeners } from "../api/httpClient";
import type { AuthenticatedUser } from "../types/auth";
import type { Permission } from "../types/permission";

const DISCORD_LOGIN_PENDING_KEY = "schub_discord_login_pending";

// sessionStorage lève dans un onglet privé ou avec les données de site bloquées.
const readDiscordLoginPending = (): boolean => {
  try {
    return sessionStorage.getItem(DISCORD_LOGIN_PENDING_KEY) === "1";
  } catch {
    return false;
  }
};

const writeDiscordLoginPending = (pending: boolean): void => {
  try {
    if (pending) {
      sessionStorage.setItem(DISCORD_LOGIN_PENDING_KEY, "1");
    } else {
      sessionStorage.removeItem(DISCORD_LOGIN_PENDING_KEY);
    }
  } catch {
    // sessionStorage indisponible : seul le message d'échec est perdu.
  }
};

interface AuthStoreValue {
  profile: AuthenticatedUser | null;
  connected: boolean;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
  isCheckingSession: boolean;
  error: string;
  discordLoginFailed: boolean;
  dismissDiscordLoginFailure: () => void;
  loginWithDiscord: () => void;
  logout: () => Promise<void>;
}

const AuthStoreContext = createContext<AuthStoreValue | undefined>(undefined);

export const AuthStoreProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<AuthenticatedUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [discordLoginFailed, setDiscordLoginFailed] = useState<boolean>(false);

  const wasConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    wasConnectedRef.current = profile !== null;
  }, [profile]);

  const dismissDiscordLoginFailure = useCallback(() => {
    setDiscordLoginFailed(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // L'état local est vidé quoi qu'il arrive.
    } finally {
      setProfile(null);
      setError("");
    }
  }, []);

  const loginWithDiscord = useCallback(() => {
    setError("");
    setDiscordLoginFailed(false);
    writeDiscordLoginPending(true);
    window.location.assign(discordLoginUrl());
  }, []);

  useEffect(() => {
    return configureSessionListeners({
      onUnauthorized: () => {
        if (wasConnectedRef.current) {
          setError(i18n.t("errors.sessionExpired", { ns: "auth" }));
        }
        setProfile(null);
      },
    });
  }, []);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const returningFromDiscord = readDiscordLoginPending();
      let connected = false;

      try {
        const me = await getMeApi();
        connected = true;
        if (active) {
          setProfile(me);
        }
      } catch {
        if (active) {
          setProfile(null);
        }
      } finally {
        if (returningFromDiscord) {
          writeDiscordLoginPending(false);
          if (active && !connected) {
            setDiscordLoginFailed(true);
          }
        }
        if (active) {
          setIsCheckingSession(false);
        }
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

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
      profile,
      connected: profile !== null,
      permissions,
      can,
      canAny,
      isCheckingSession,
      error,
      discordLoginFailed,
      dismissDiscordLoginFailure,
      loginWithDiscord,
      logout,
    }),
    [
      profile,
      permissions,
      can,
      canAny,
      isCheckingSession,
      error,
      discordLoginFailed,
      dismissDiscordLoginFailure,
      loginWithDiscord,
      logout,
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
