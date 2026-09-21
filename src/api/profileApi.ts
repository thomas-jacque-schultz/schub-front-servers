import { ApiError, requestJson } from "./httpClient";
import type {
  DisplayNameRequest,
  KnownRiotAccountDto,
  ProfileDto,
  RiotAccountChangeDto,
  RiotAccountRequest,
} from "../types/profile";

/**
 * Le profil de l'appelant. Le BFF relaie vers le cœur, qui porte l'identité depuis le 18-09.
 *
 * <p>Aucune de ces fonctions ne prend d'identifiant : le cookie de session part seul, le BFF en
 * tire l'acteur et le transmet au cœur en `X-Actor-Id`. Il n'existe **aucun chemin** vers le
 * profil de quelqu'un d'autre, ce qui est une garantie plus solide qu'une permission à
 * vérifier.</p>
 *
 * <p>Les chemins sont ceux du cœur, qui en a deux : `/me` pour l'identité et le nom affiché,
 * `/users/me/riot-account` pour le compte Riot. Les uniformiser ici ferait diverger le front des
 * deux moitiés du même profil.</p>
 */

export const getProfileApi = async (): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/me", { method: "GET" });

export const updateDisplayNameApi = async (displayName: string): Promise<ProfileDto> =>
  requestJson<ProfileDto>("/me/display-name", {
    method: "PUT",
    body: JSON.stringify({ displayName } satisfies DisplayNameRequest),
  });

/**
 * Le refus qui **porte** les conséquences du changement.
 *
 * <p>Le cœur répond 409 à un remplacement non confirmé, et son corps contient l'objet `change`.
 * Ce n'est pas une erreur à afficher telle quelle : c'est la réponse dont l'écran a besoin pour
 * poser la question, et elle évite une route de prévisualisation de plus.</p>
 */
export class RiotAccountChangeRequired extends Error {
  readonly change: RiotAccountChangeDto;

  constructor(change: RiotAccountChangeDto) {
    super("Le changement de compte Riot demande une confirmation");
    this.name = "RiotAccountChangeRequired";
    this.change = change;
  }
}

/** Le `change` d'un corps d'erreur, s'il y est. Un 409 ordinaire n'en porte pas. */
const changeFromPayload = (payload: unknown): RiotAccountChangeDto | null => {
  if (payload && typeof payload === "object" && "change" in payload) {
    const change = (payload as { change: unknown }).change;
    if (change && typeof change === "object") {
      return change as RiotAccountChangeDto;
    }
  }
  return null;
};

/**
 * Déclarer, relancer ou remplacer son Riot ID.
 *
 * <p>Idempotente : rejouer le même Riot ID relance la résolution du `puuid`. C'est exactement le
 * « réessayer » dont l'écran a besoin quand le connecteur Riot était éteint au moment de la
 * saisie — l'état `EN_ATTENTE_DE_RESOLUTION` n'est pas une impasse.</p>
 *
 * <p>Sans `confirmChange`, remplacer un <em>autre</em> compte lève {@link RiotAccountChangeRequired}
 * plutôt qu'une erreur générique : les deux 409 possibles — « déjà pris par quelqu'un d'autre » et
 * « confirmez le remplacement » — demandent des gestes opposés, et les confondre proposerait de
 * confirmer ce qui ne peut pas l'être.</p>
 */
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

/** Une seule route sert les deux gestes de l'écran : le chemin est construit une fois. */
const suggestionsPath = (query: string, limit: number): string =>
  `/users/me/riot-account/suggestions?${new URLSearchParams({ q: query, limit: String(limit) })}`;

/**
 * Les comptes connus qui ressemblent à la saisie.
 *
 * <p><strong>Ne jamais lui passer un `Pseudo#TAG` complet.</strong> Le cœur traite une saisie
 * complète comme une demande de vérification et appelle Riot : la frappe n'a pas à déclencher un
 * appel sortant, et c'est le bouton qui en porte la décision. La recherche cherche sur le pseudo.</p>
 *
 * <p><strong>Une absence de résultat n'est pas une erreur, et une panne non plus.</strong> Nos
 * données sont vides tant que rien n'a été ingéré — le cas normal au démarrage. On rend donc une
 * liste vide plutôt que de casser l'écran de liaison à chaque frappe.</p>
 *
 * <p>Un 401 n'est pas avalé : il remonte, parce que c'est lui qui ferme la session.</p>
 */
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

/**
 * Demander à Riot si ce Riot ID existe, et le faire entrer dans l'index s'il existe.
 *
 * <p>Même route que la recherche, et ce n'est pas un raccourci : un `Pseudo#TAG` complet
 * <em>est</em> la question « ce compte existe-t-il ? », et la réponse est la liste où il figure
 * désormais. Ce geste ne lie rien — lier reste le clic sur une proposition.</p>
 *
 * <p>Ici les erreurs remontent, à l'inverse de la recherche : quelqu'un a posé une question
 * explicite, et rendre une liste vide lui ferait lire « ce compte n'existe pas » là où le
 * connecteur était seulement injoignable.</p>
 */
export const verifyRiotAccountApi = async (
  riotId: string,
  limit = 8,
): Promise<KnownRiotAccountDto[]> =>
  requestJson<KnownRiotAccountDto[]>(suggestionsPath(riotId, limit), { method: "GET" });
