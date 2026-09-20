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
import i18n from "../i18n";
import { discordLoginUrl, getMeApi, loginApi, logoutApi } from "../api/authApi";
import { configureSessionListeners } from "../api/httpClient";
import type { AuthenticatedUser } from "../types/auth";
import type { Permission } from "../types/permission";

/**
 * La trace d'un aller-retour vers Discord en cours.
 *
 * <p>Ce n'est **pas** un jeton ni un fragment d'identité : c'est un drapeau qui vaut `"1"` et
 * qui sert à une seule chose — savoir, en revenant sur le site, qu'on en revient. Il vit en
 * `sessionStorage` parce qu'il doit survivre à une navigation complète (le flux OAuth quitte le
 * site) mais mourir avec l'onglet.</p>
 *
 * <p><strong>Pourquoi il faut ce drapeau.</strong> Le BFF ne renvoie l'utilisateur sur le site
 * que dans un seul cas d'échec : le refus explicite devant l'écran d'autorisation de Discord. Il
 * redirige alors vers `/` **sans rien dans l'URL** — délibérément, pour ne pas faire transiter
 * le motif par les journaux du proxy. Sans ce drapeau, ce retour est indiscernable d'une visite
 * ordinaire, et l'utilisateur revient sur un site inchangé sans savoir si quelque chose a
 * échoué.</p>
 */
const DISCORD_LOGIN_PENDING_KEY = "schub_discord_login_pending";

/** `sessionStorage` lève dans un onglet privé ou avec les données de site bloquées. */
const readDiscordLoginPending = (): boolean => {
  try {
    return sessionStorage.getItem(DISCORD_LOGIN_PENDING_KEY) === "1";
  } catch {
    return false;
  }
};

const writeDiscordLoginPending = (pending: boolean): void => {
  try {
    if (pending) {
      sessionStorage.setItem(DISCORD_LOGIN_PENDING_KEY, "1");
    } else {
      sessionStorage.removeItem(DISCORD_LOGIN_PENDING_KEY);
    }
  } catch {
    // Sans ce drapeau, on perd seulement le message d'échec — pas la connexion elle-même.
  }
};

interface AuthStoreValue {
  profile: AuthenticatedUser | null;
  connected: boolean;
  /** Les permissions du rôle de l'acteur, telles que le jeton les porte. */
  permissions: Permission[];
  /**
   * Le test de droit de l'interface.
   *
   * <p>Il remplace l'ancien `isAdmin`, qui comparait une chaîne de rôle : un rôle est éditable
   * en base depuis le lot A.1, donc son nom ne dit plus rien de ce qu'il permet. Une seule
   * fonction, à un seul endroit, plutôt qu'une comparaison recopiée dans chaque composant.</p>
   */
  can: (permission: Permission) => boolean;
  /** Vrai si l'acteur détient **au moins une** des permissions — pour une entrée de menu. */
  canAny: (...permissions: Permission[]) => boolean;
  isCheckingSession: boolean;
  isSubmitting: boolean;
  error: string;
  /** Vrai au retour d'un aller-retour Discord qui n'a pas abouti. Voir le drapeau ci-dessus. */
  discordLoginFailed: boolean;
  dismissDiscordLoginFailure: () => void;
  /** Quitte le site vers l'écran d'autorisation Discord. Ne rend jamais la main. */
  loginWithDiscord: () => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthStoreContext = createContext<AuthStoreValue | undefined>(undefined);

/**
 * La session, telle que le front la connaît depuis la décision n°4 : **il n'en connaît rien**.
 *
 * <p>Le jeton vit dans un cookie `httpOnly` posé par le BFF. Ce store ne le lit pas, ne le
 * stocke pas et ne l'envoie pas : il n'y a plus ni `accessToken` ni `localStorage` ici. L'état
 * connecté est ce que répond `GET /auth/me`, et rien d'autre.</p>
 *
 * <p>La <strong>réémission glissante</strong> (décision n°3) n'apparaît nulle part dans ce
 * fichier, et c'est le résultat recherché : le serveur repose le cookie de lui-même quand il
 * reste moins de la moitié de la durée de vie du jeton. L'ancien code lisait un en-tête
 * `X-Auth-Token` pour ranger le jeton frais — ce travail n'existe plus.</p>
 */
export const AuthStoreProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<AuthenticatedUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [discordLoginFailed, setDiscordLoginFailed] = useState<boolean>(false);

  /**
   * Y avait-il une session ouverte au moment du refus ?
   *
   * <p>Un 401 sur le premier `/auth/me` d'un visiteur jamais connecté est la réponse *normale* :
   * lui annoncer « session expirée » serait un mensonge affiché à chaque arrivée sur le site. La
   * référence distingue les deux sans faire dépendre l'abonnement de l'état.</p>
   */
  const wasConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    wasConnectedRef.current = profile !== null;
  }, [profile]);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const dismissDiscordLoginFailure = useCallback(() => {
    setDiscordLoginFailed(false);
  }, []);

  /**
   * Se déconnecter — une requête, pas un oubli.
   *
   * <p>Le cookie est `httpOnly` : seul le serveur peut l'effacer, par le `Set-Cookie` vide que
   * renvoie `POST /auth/logout`. Vider l'état local sans cet appel laisserait le navigateur
   * continuer d'envoyer un jeton valide — la personne se croirait déconnectée et ne le serait
   * pas.</p>
   *
   * <p>L'état local est vidé <strong>même si l'appel échoue</strong> : un BFF injoignable ne doit
   * pas coincer quelqu'un dans une session dont il veut sortir. Le jeton expire de lui-même en
   * quinze minutes (décision n°3), ce qui borne la conséquence.</p>
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Voir ci-dessus : on ferme quand même côté client.
    } finally {
      setProfile(null);
      setError("");
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsSubmitting(true);
    setError("");

    try {
      // La réponse pose le cookie ; son corps ne nous intéresse pas. C'est `/auth/me` qui dit
      // qui vient d'être connecté, et lui seul — une seule source pour un seul état.
      await loginApi({ username, password });
      setProfile(await getMeApi());
    } catch (loginError) {
      const message =
        loginError instanceof Error ? loginError.message : i18n.t("errors.loginFailed", { ns: "auth" });
      setError(message);
      throw loginError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * La connexion Discord : une **navigation**, pas une requête.
   *
   * <p>`window.location.assign` et non `fetch` : `GET /auth/discord` répond une 302 vers
   * `discord.com`. Un `fetch` suivrait la redirection et échouerait sur la politique d'origine,
   * et l'écran d'autorisation ne s'afficherait de toute façon jamais — il faut que le navigateur
   * y aille pour de bon.</p>
   */
  const loginWithDiscord = useCallback(() => {
    setError("");
    setDiscordLoginFailed(false);
    writeDiscordLoginPending(true);
    window.location.assign(discordLoginUrl());
  }, []);

  /**
   * La réaction au refus du serveur.
   *
   * <p>Un 401 ferme la session au lieu de laisser l'écran en place : sans ça, un cookie expiré
   * produit une page qui s'affiche normalement et dont chaque bouton échoue — l'état mort que le
   * raccourcissement du jeton à quinze minutes rendrait quotidien. Les gardes de routage
   * ramènent alors d'elles-mêmes à l'écran de connexion, puisqu'elles suivent `connected`.</p>
   */
  useEffect(() => {
    return configureSessionListeners({
      onUnauthorized: () => {
        if (wasConnectedRef.current) {
          setError(i18n.t("errors.sessionExpired", { ns: "auth" }));
        }
        setProfile(null);
      },
    });
  }, []);

  /**
   * L'amorçage : une fois, au montage.
   *
   * <p>Il n'y a plus rien à surveiller — pas de jeton en état qui changerait. Le navigateur a un
   * cookie ou n'en a pas, et `/auth/me` tranche.</p>
   */
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const returningFromDiscord = readDiscordLoginPending();
      let connected = false;

      try {
        const me = await getMeApi();
        connected = true;
        if (active) {
          setProfile(me);
        }
      } catch {
        if (active) {
          setProfile(null);
        }
      } finally {
        if (returningFromDiscord) {
          // À usage unique, quel que soit le dénouement : le garder ferait réapparaître le
          // message au rechargement suivant, longtemps après la tentative.
          writeDiscordLoginPending(false);
          if (active && !connected) {
            setDiscordLoginFailed(true);
          }
        }
        if (active) {
          setIsCheckingSession(false);
        }
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  const permissions = useMemo<Permission[]>(() => profile?.permissions ?? [], [profile]);

  const can = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions],
  );

  const canAny = useCallback(
    (...candidates: Permission[]) => candidates.some((candidate) => permissions.includes(candidate)),
    [permissions],
  );

  const value = useMemo<AuthStoreValue>(
    () => ({
      profile,
      connected: profile !== null,
      permissions,
      can,
      canAny,
      isCheckingSession,
      isSubmitting,
      error,
      discordLoginFailed,
      dismissDiscordLoginFailure,
      loginWithDiscord,
      login,
      logout,
      clearError,
    }),
    [
      profile,
      permissions,
      can,
      canAny,
      isCheckingSession,
      isSubmitting,
      error,
      discordLoginFailed,
      dismissDiscordLoginFailure,
      loginWithDiscord,
      login,
      logout,
      clearError,
    ],
  );

  return (
    <AuthStoreContext.Provider value={value}>{children}</AuthStoreContext.Provider>
  );
};

export const useAuthStore = (): AuthStoreValue => {
  const context = useContext(AuthStoreContext);
  if (!context) {
    throw new Error("useAuthStore must be used inside AuthStoreProvider");
  }

  return context;
};
