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
import { getProfileApi } from "../api/profileApi";
import { useAuthStore } from "./authStore";
import type { ProfileDto } from "../types/profile";

interface ProfileStoreValue {
  profile: ProfileDto | null;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
  setProfile: (profile: ProfileDto) => void;
  riotLinked: boolean;
  ingestInFlight: boolean;
}

const ProfileStoreContext = createContext<ProfileStoreValue | undefined>(
  undefined,
);

export const ProfileStoreProvider = ({ children }: { children: ReactNode }) => {
  const { connected } = useAuthStore();

  const [profile, setProfileState] = useState<ProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Rechargé toutes les 30 s pendant une collecte : une erreur passagère garde le profil connu, et une
  // réponse dépassée par une plus récente est jetée.
  const derniere = useRef(0);
  const reload = useCallback(async () => {
    const numero = ++derniere.current;
    setIsLoading(true);
    setError("");
    try {
      const lu = await getProfileApi();
      if (numero === derniere.current) {
        setProfileState(lu);
      }
    } catch (loadError) {
      if (numero === derniere.current) {
        setError(loadError instanceof Error ? loadError.message : "");
      }
    } finally {
      if (numero === derniere.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!connected) {
      derniere.current++;
      setProfileState(null);
      setIsLoading(false);
      setError("");
      return;
    }
    void reload();
  }, [connected, reload]);

  const setProfile = useCallback((next: ProfileDto) => {
    setProfileState(next);
  }, []);

  const riotLinked = profile?.riot.state === "RESOLU";

  const ingestInFlight = Boolean(
    profile?.riot.ingest &&
    (profile.riot.ingest.running > 0 || profile.riot.ingest.pending > 0),
  );

  const value = useMemo<ProfileStoreValue>(
    () => ({
      profile,
      isLoading,
      error,
      reload,
      setProfile,
      riotLinked,
      ingestInFlight,
    }),
    [profile, isLoading, error, reload, setProfile, riotLinked, ingestInFlight],
  );

  return (
    <ProfileStoreContext.Provider value={value}>
      {children}
    </ProfileStoreContext.Provider>
  );
};

export const useProfileStore = (): ProfileStoreValue => {
  const context = useContext(ProfileStoreContext);
  if (!context) {
    throw new Error("useProfileStore must be used inside ProfileStoreProvider");
  }

  return context;
};
