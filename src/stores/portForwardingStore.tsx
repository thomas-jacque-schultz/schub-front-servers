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
  /** Ce que le routeur porte réellement, redirections manuelles comprises. */
  routerRules: PortRuleDto[];
  /** Les règles permanentes détenues par l'application — les seules supprimables. */
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
      // Les deux listes disent des choses différentes : l'une l'état du routeur, l'autre ce
      // que l'application détient. Il faut les deux pour savoir quoi afficher et quoi permettre.
      //
      // L'état du routeur est facultatif : il répond 503 quand le pilotage est désactivé, et
      // échoue si la box est injoignable. Les règles permanentes, elles, restent lisibles —
      // perdre toute la vue parce que le routeur se tait serait disproportionné.
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

  // Les mutations relisent l'état plutôt que de le deviner : le back réconcilie dans la
  // foulée, et lui seul sait ce que le routeur a réellement accepté.
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
