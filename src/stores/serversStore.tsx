import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import i18n from "../i18n";
import { getDisplayedServersApi, getPublicDisplayedServersApi } from "../api/serversApi";
import type { DisplayedServer } from "../types/server";

interface ServersStoreValue {
  servers: DisplayedServer[];
  isLoading: boolean;
  error: string;
  lastRefreshedAt: Date | null;
  loadServers: () => Promise<void>;
  loadPublicServers: () => Promise<void>;
  resetServers: () => void;
}

const ServersStoreContext = createContext<ServersStoreValue | undefined>(undefined);

export const ServersStoreProvider = ({ children }: { children: ReactNode }) => {
  const [servers, setServers] = useState<DisplayedServer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const loadServers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const payload = await getDisplayedServersApi();
      setServers(payload);
      setLastRefreshedAt(new Date());
    } catch (serversError) {
      const message =
        serversError instanceof Error
          ? serversError.message
          : i18n.t("errors.loadFailed", { ns: "servers" });
      setError(message);
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPublicServers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const payload = await getPublicDisplayedServersApi();
      setServers(payload);
      setLastRefreshedAt(new Date());
    } catch (serversError) {
      const message =
        serversError instanceof Error
          ? serversError.message
          : i18n.t("errors.loadFailed", { ns: "servers" });
      setError(message);
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetServers = useCallback(() => {
    setServers([]);
    setError("");
    setIsLoading(false);
    setLastRefreshedAt(null);
  }, []);

  const value = useMemo<ServersStoreValue>(
    () => ({
      servers,
      isLoading,
      error,
      lastRefreshedAt,
      loadServers,
      loadPublicServers,
      resetServers,
    }),
    [servers, isLoading, error, lastRefreshedAt, loadServers, loadPublicServers, resetServers],
  );

  return (
    <ServersStoreContext.Provider value={value}>
      {children}
    </ServersStoreContext.Provider>
  );
};

export const useServersStore = (): ServersStoreValue => {
  const context = useContext(ServersStoreContext);
  if (!context) {
    throw new Error("useServersStore must be used inside ServersStoreProvider");
  }

  return context;
};
