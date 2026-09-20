import { useEffect, useRef, useState } from "react";

/**
 * La clé publique Turnstile. **Absente, le composant ne rend rien et n'échoue pas.**
 *
 * <p>C'est la condition posée au §4 du plan : la clé n'existe pas encore, et le développement ne
 * doit pas en dépendre. Le BFF applique la même règle en miroir — sans `TURNSTILE_SECRET`, il ne
 * réclame aucun jeton. Les deux autres couches anti-spam, elles, sont actives en permanence.</p>
 */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SCRIPT_ID = "cf-turnstile-script";

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme: "dark" | "light" | "auto";
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Charge le script une seule fois, quel que soit le nombre de montages. */
const loadScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("turnstile")));
    document.head.appendChild(script);
  });

/**
 * Le rempart Cloudflare, **optionnel par construction**.
 *
 * <p>Il n'est pas dans `src/design-system/` volontairement : ce n'est pas une primitive
 * d'interface mais un widget tiers, qui charge un script externe et dessine ce qu'il veut. Le
 * design system ne doit pas lui servir de couverture.</p>
 *
 * <p>Sans clé, il rend `null` et le formulaire fonctionne sans lui. C'est ce qui permet de
 * développer et de livrer avant que la clé existe, au lieu d'attendre.</p>
 */
export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !container.current) {
      return;
    }

    let widgetId: string | undefined;
    let cancelled = false;
    const element = container.current;

    void loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) {
          return;
        }
        widgetId = window.turnstile.render(element, {
          sitekey: SITE_KEY,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => setFailed(true),
          theme: "auto",
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [onToken]);

  if (!SITE_KEY || failed) {
    // Un rempart qui ne se charge pas ne doit pas bloquer l'envoi : le champ leurre et la
    // limitation de débit du BFF restent en place, et le BFF reste seul juge du refus.
    return null;
  }

  return <div ref={container} />;
}
