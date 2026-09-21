import { ApiError, requestJson } from "./httpClient";
import type {
  DisplayNameRequest,
  KnownRiotAccountDto,
  ProfileDto,
  RiotAccountChangePreviewDto,
  RiotAccountRequest,
} from "../types/profile";

/**
 * Le profil de l'appelant. Le BFF relaie vers le cœur, qui porte l'identité depuis le 18-09.
 *
 * <p>Aucune de ces fonctions ne prend d'identifiant : le cookie de session part seul, le BFF en
 * tire l'acteur et le transmet au cœur en `X-Actor-Id`. Il n'existe **aucun chemin** vers le
 * profil de quelqu'un d'autre, ce qui est une garantie plus solide qu'une permission à
 * vérifier.</p>
 */

export const getProfileApi = async (): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/users/me", { method: "GET" });

export const updateDisplayNameApi = async (displayName: string): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/users/me/display-name", {
    method: "PUT",
    body: JSON.stringify({ displayName } satisfies DisplayNameRequest),
  });

/**
 * Déclarer ou remplacer son Riot ID.
 *
 * <p>Idempotente : rejouer le même Riot ID relance la résolution du `puuid`. C'est exactement le
 * « réessayer » dont l'écran a besoin quand le connecteur Riot était éteint au moment de la
 * saisie — l'état `EN_ATTENTE_DE_RESOLUTION` n'est pas une impasse.</p>
 */
export const linkRiotAccountApi = async (riotId: string): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/users/me/riot-account", {
    method: "PUT",
    body: JSON.stringify({ riotId } satisfies RiotAccountRequest),
  });

/**
 * Les comptes connus qui ressemblent à la saisie.
 *
 * <p><strong>Une absence de résultat n'est pas une erreur, et une panne non plus.</strong> Deux
 * cas se confondent à l'écran s'ils ne sont pas distingués ici : nos données sont vides parce que
 * rien n'a encore été ingéré — le cas normal au démarrage — ou la route n'a pas répondu. Dans les
 * deux cas la suggestion est une aide, et la saisie exacte reste ouverte : on rend donc une liste
 * vide plutôt que de propager une exception qui casserait l'écran de liaison.</p>
 *
 * <p>Un 401 n'est pas avalé : il remonte, parce que c'est lui qui ferme la session.</p>
 */
export const searchKnownRiotAccountsApi = async (
  query: string,
  limit = 8,
): Promise<KnownRiotAccountDto[]> => {
  const params = new URLSearchParams({ q: query, limit: String(limit) });

  try {
    return await requestJson<KnownRiotAccountDto[]>(`/riot-accounts/search?${params}`, {
      method: "GET",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error;
    }
    return [];
  }
};

/**
 * Les conséquences d'un changement, avant de le valider.
 *
 * <p>Rend `null` si le cœur ne sait pas les établir. L'écran affiche alors les avertissements
 * qu'il connaît sans les chiffres — il n'invente pas un nombre de parties perdues.</p>
 */
export const previewRiotAccountChangeApi = async (
  riotId: string,
): Promise<RiotAccountChangePreviewDto | null> => {
  const params = new URLSearchParams({ riotId });

  try {
    return await requestJson<RiotAccountChangePreviewDto>(
      `/users/me/riot-account/change-preview?${params}`,
      { method: "GET" },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw error;
    }
    return null;
  }
};
