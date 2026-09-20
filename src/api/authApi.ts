import { apiUrl, requestJson } from "./httpClient";
import { isPermission } from "../types/permission";
import type { Permission } from "../types/permission";
import type { AuthMeResponse, AuthenticatedUser, LoginRequest } from "../types/auth";

const normalizeRoles = (roles: AuthMeResponse["roles"]): string[] =>
  roles
    .map((role) => {
      if (typeof role === "string") {
        return role;
      }

      if (role && typeof role === "object" && "authority" in role) {
        return String(role.authority);
      }

      return "";
    })
    .filter(Boolean);

/**
 * Les permissions servies par le BFF, filtrées sur celles que ce front connaît.
 *
 * <p>Une permission inconnue est ignorée plutôt que propagée : le cœur peut en ajouter une avant
 * que le front sache quoi en faire (les `SCRIM_*` du chantier D, par exemple), et la garder ne
 * ferait qu'introduire une valeur que rien ici ne teste.</p>
 */
const normalizePermissions = (permissions?: string[]): Permission[] =>
  (permissions ?? []).filter(isPermission);

/**
 * La connexion par mot de passe — la porte de service, jusqu'au lot A.6.
 *
 * <p>Le BFF renvoie encore un `accessToken` dans le corps, pour le front d'avant la migration.
 * **Ce front ne le lit pas** : la même réponse pose un cookie `httpOnly`, et c'est ce cookie qui
 * authentifie les requêtes suivantes. Lire le jeton ici, ne serait-ce que pour le ranger
 * quelque part, rouvrirait exactement ce que la décision n°4 ferme.</p>
 */
export const loginApi = async (payload: LoginRequest): Promise<void> => {
  await requestJson<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * Qui est connecté — la seule source de l'état de session.
 *
 * <p>Aucun en-tête `Authorization` : le cookie voyage seul, joint par le navigateur grâce au
 * `credentials: "include"` de `httpClient`.</p>
 */
export const getMeApi = async (): Promise<AuthenticatedUser> => {
  const response = await requestJson<AuthMeResponse>("/auth/me", { method: "GET" });

  return {
    actorId: response.actorId,
    userId: response.userId ?? null,
    username: response.username,
    roles: normalizeRoles(response.roles || []),
    permissions: normalizePermissions(response.permissions),
  };
};

/**
 * Se déconnecter, c'est-à-dire demander au serveur d'effacer le cookie.
 *
 * <p>Ce n'est pas une politesse : un cookie `httpOnly` est **ineffaçable depuis le front**.
 * Oublier le profil côté client laisserait le navigateur continuer d'envoyer le jeton jusqu'à
 * son expiration — l'utilisateur se croirait déconnecté sans l'être.</p>
 */
export const logoutApi = async (): Promise<void> => {
  await requestJson<unknown>("/auth/logout", { method: "POST" });
};

/**
 * Où envoyer le navigateur pour démarrer la connexion Discord.
 *
 * <p><strong>C'est une navigation, pas un appel `fetch`.</strong> `GET /auth/discord` répond une
 * 302 vers `discord.com` ; un `fetch` suivrait cette redirection et se ferait refuser par la
 * politique d'origine — et même s'il aboutissait, l'écran d'autorisation de Discord doit
 * s'afficher à l'utilisateur, ce qu'une requête en arrière-plan ne peut pas faire.</p>
 */
export const discordLoginUrl = (): string => apiUrl("/auth/discord");
