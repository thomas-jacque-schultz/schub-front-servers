import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  createStaticPortRuleApi,
  deleteStaticPortRuleApi,
  getPortRulesApi,
  getStaticPortRulesApi,
} from "../api/portForwardingApi";
import i18n from "../i18n";
import type { PortRuleDto, StaticPortRuleDto } from "../types/portForwarding";

interface PortForwardingStoreValue {
  routerRules: PortRuleDto[];
  staticRules: StaticPortRuleDto[];
  isLoading: boolean;
  error: string;
  lastRefreshedAt: Date | null;
  loadPortForwarding: () => Promise<void>;
  createStaticRule: (rule: StaticPortRuleDto) => Promise<void>;
  deleteStaticRule: (id: string) => Promise<void>;
  resetPortForwarding: () => void;
}

const PortForwardingStoreContext = createContext<PortForwardingStoreValue | undefined>(undefined);

export const PortForwardingStoreProvider = ({ children }: { children: ReactNode }) => {
  const [routerRules, setRouterRules] = useState<PortRuleDto[]>([]);
  const [staticRules, setStaticRules] = useState<StaticPortRuleDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const loadPortForwarding = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [rules, statics] = await Promise.all([
        getPortRulesApi().catch(() => [] as PortRuleDto[]),
        getStaticPortRulesApi(),
      ]);
      setRouterRules(rules);
      setStaticRules(statics);
      setLastRefreshedAt(new Date());
    } catch (portForwardingError) {
      const message =
        portForwardingError instanceof Error
          ? portForwardingError.message
          : i18n.t("errors.loadFailed", { ns: "ports" });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStaticRule = useCallback(
    async (rule: StaticPortRuleDto) => {
      await createStaticPortRuleApi(rule);
      await loadPortForwarding();
    },
    [loadPortForwarding],
  );

  const deleteStaticRule = useCallback(
    async (id: string) => {
      await deleteStaticPortRuleApi(id);
      await loadPortForwarding();
    },
    [loadPortForwarding],
  );

  const resetPortForwarding = useCallback(() => {
    setRouterRules([]);
    setStaticRules([]);
    setError("");
    setLastRefreshedAt(null);
  }, []);

  const value = useMemo<PortForwardingStoreValue>(
    () => ({
      routerRules,
      staticRules,
      isLoading,
      error,
      lastRefreshedAt,
      loadPortForwarding,
      createStaticRule,
      deleteStaticRule,
      resetPortForwarding,
    }),
    [
      routerRules,
      staticRules,
      isLoading,
      error,
      lastRefreshedAt,
      loadPortForwarding,
      createStaticRule,
      deleteStaticRule,
      resetPortForwarding,
    ],
  );

  return (
    <PortForwardingStoreContext.Provider value={value}>
      {children}
    </PortForwardingStoreContext.Provider>
  );
};

export const usePortForwardingStore = (): PortForwardingStoreValue => {
  const context = useContext(PortForwardingStoreContext);
  if (!context) {
    throw new Error("usePortForwardingStore must be used inside PortForwardingStoreProvider");
  }

  return context;
};
