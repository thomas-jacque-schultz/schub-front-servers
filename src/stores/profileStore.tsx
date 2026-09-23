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
  reload: () => Promise<void>;
  setProfile: (profile: ProfileDto) => void;
  riotLinked: boolean;
  ingestInFlight: boolean;
}

const ProfileStoreContext = createContext<ProfileStoreValue | undefined>(undefined);

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
