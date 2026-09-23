import { ApiError, requestJson } from "./httpClient";
import type {
  DisplayNameRequest,
  KnownRiotAccountDto,
  ProfileDto,
  RiotAccountChangeDto,
  RiotAccountRequest,
} from "../types/profile";

export const getProfileApi = async (): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/me", { method: "GET" });

export const updateDisplayNameApi = async (displayName: string): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/me/display-name", {
    method: "PUT",
    body: JSON.stringify({ displayName } satisfies DisplayNameRequest),
  });

export class RiotAccountChangeRequired extends Error {
  readonly change: RiotAccountChangeDto;

  constructor(change: RiotAccountChangeDto) {
    super("Le changement de compte Riot demande une confirmation");
    this.name = "RiotAccountChangeRequired";
    this.change = change;
  }
}

const changeFromPayload = (payload: unknown): RiotAccountChangeDto | null => {
  if (payload && typeof payload === "object" && "change" in payload) {
    const change = (payload as { change: unknown }).change;
    if (change && typeof change === "object") {
      return change as RiotAccountChangeDto;
    }
  }
  return null;
};

export const linkRiotAccountApi = async (
  riotId: string,
  confirmChange = false,
): Promise<ProfileDto> => {
  try {
    return await requestJson<ProfileDto>("/users/me/riot-account", {
      method: "PUT",
      body: JSON.stringify({ riotId, confirmChange } satisfies RiotAccountRequest),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const change = changeFromPayload(error.payload);
      if (change) {
        throw new RiotAccountChangeRequired(change);
      }
    }
    throw error;
  }
};

const suggestionsPath = (query: string, limit: number): string =>
  `/users/me/riot-account/suggestions?${new URLSearchParams({ q: query, limit: String(limit) })}`;

// Jamais un Pseudo#TAG complet : le cœur le traite comme une vérification et appelle Riot.
export const searchKnownRiotAccountsApi = async (
  query: string,
  limit = 8,
): Promise<KnownRiotAccountDto[]> => {
  try {
    return await requestJson<KnownRiotAccountDto[]>(suggestionsPath(query, limit), { method: "GET" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error;
    }
    return [];
  }
};

export const verifyRiotAccountApi = async (
  riotId: string,
  limit = 8,
): Promise<KnownRiotAccountDto[]> =>
  requestJson<KnownRiotAccountDto[]>(suggestionsPath(riotId, limit), { method: "GET" });
