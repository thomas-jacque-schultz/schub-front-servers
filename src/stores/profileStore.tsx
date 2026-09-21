import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProfileApi } from "../api/profileApi";
import { useAuthStore } from "./authStore";
import type { ProfileDto } from "../types/profile";

interface ProfileStoreValue {
  profile: ProfileDto | null;
  isLoading: boolean;
  error: string;
  /** Relit `/users/me`. À appeler après toute écriture qui change le profil. */
  reload: () => Promise<void>;
  /** Range le profil rendu par une écriture, sans second appel. */
  setProfile: (profile: ProfileDto) => void;
  /** Le compte Riot est-il résolu ? La seule condition qui ouvre *Mes stats*. */
  riotLinked: boolean;
  /** Une collecte est-elle en cours ou en attente ? `false` si l'avancement est inconnu. */
  ingestInFlight: boolean;
}

const ProfileStoreContext = createContext<ProfileStoreValue | undefined>(undefined);

/**
 * Le profil de l'appelant, chargé une fois et partagé.
 *
 * <p>Il est ici et non dans chaque écran parce que trois consommateurs en dépendent et qu'ils ne
 * sont pas dans le même arbre : le **menu** (qui grise *Mes stats*), l'**écran de profil** et
 * l'**écran de stats**. Le faire charger par chacun donnerait trois appels au montage et trois
 * états qui divergent dès la première écriture.</p>
 *
 * <p>Il ne se charge que **connecté** : `/users/me` répond 401 à un visiteur anonyme, et ce 401
 * fermerait la session par le canal de `httpClient`. Le portfolio, qui est public, ne doit
 * déclencher aucun appel authentifié.</p>
 */
export const ProfileStoreProvider = ({ children }: { children: ReactNode }) => {
  const { connected } = useAuthStore();

  const [profile, setProfileState] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setProfileState(await getProfileApi());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "");
      setProfileState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!connected) {
      // La déconnexion vide le profil : le garder afficherait le nom du précédent connecté.
      setProfileState(null);
      setError("");
      return;
    }
    void reload();
  }, [connected, reload]);

  const setProfile = useCallback((next: ProfileDto) => {
    setProfileState(next);
  }, []);

  const riotLinked = profile?.riot.state === "RESOLU";

  /**
   * Une collecte en cours n'est pas la même chose qu'un avancement inconnu.
   *
   * <p>`ingest` vaut `null` quand le connecteur Riot est injoignable. Le lire comme « rien en
   * attente » ferait disparaître l'indicateur au moment précis où l'on ne sait plus rien — le
   * contraire de ce qu'un indicateur doit faire.</p>
   */
  const ingestInFlight = Boolean(
    profile?.riot.ingest && (profile.riot.ingest.running > 0 || profile.riot.ingest.pending > 0),
  );

  const value = useMemo<ProfileStoreValue>(
    () => ({ profile, isLoading, error, reload, setProfile, riotLinked, ingestInFlight }),
    [profile, isLoading, error, reload, setProfile, riotLinked, ingestInFlight],
  );

  return <ProfileStoreContext.Provider value={value}>{children}</ProfileStoreContext.Provider>;
};

export const useProfileStore = (): ProfileStoreValue => {
  const context = useContext(ProfileStoreContext);
  if (!context) {
    throw new Error("useProfileStore must be used inside ProfileStoreProvider");
  }

  return context;
};
