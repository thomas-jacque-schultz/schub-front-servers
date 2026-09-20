import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface DocumentMeta {
  title: string;
  description: string;
  /** L'image d'aperçu au partage. Par défaut, celle déclarée dans `index.html`. */
  image?: string;
}

const MARKER = "data-schub-meta";

/** Pose une balise `<meta>` et la marque, pour pouvoir la retirer au démontage. */
const setMeta = (attribute: "name" | "property", key: string, value: string) => {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  const node = existing ?? document.createElement("meta");
  node.setAttribute(attribute, key);
  node.setAttribute("content", value);
  if (!existing) {
    node.setAttribute(MARKER, "");
    document.head.appendChild(node);
  }
  return node;
};

/**
 * Le titre, la description et les balises de partage de l'écran courant.
 *
 * <p>Un SPA ne produit qu'un `index.html`, donc un seul titre pour tout le site. C'est sans
 * conséquence pour une application d'administration derrière une authentification ; ça ne l'est
 * plus pour la racine d'un domaine personnel, où le titre et la description sont ce qu'un moteur
 * de recherche affiche et ce qu'un lien partagé montre.</p>
 *
 * <p><strong>Ce que ça ne règle pas, et qu'il faut savoir</strong> : ces balises sont posées par
 * JavaScript, après le chargement. Google les lit, parce qu'il exécute le JavaScript ; la
 * plupart des aperçus de partage (Discord, Slack, LinkedIn) ne l'exécutent pas et se contentent
 * de ce que `index.html` contient. D'où la règle tenue ici : <em>`index.html` porte des valeurs
 * correctes pour la racine</em>, et ce hook ne fait que les affiner écran par écran. La vraie
 * réponse est le pré-rendu, que le contenu en données rend possible sans réécriture.</p>
 */
export function useDocumentMeta({ title, description, image }: DocumentMeta) {
  const { pathname } = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const canonicalUrl = `${window.location.origin}${pathname}`;

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }

    const existingCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonical = existingCanonical ?? document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", canonicalUrl);
    if (!existingCanonical) {
      canonical.setAttribute(MARKER, "");
      document.head.appendChild(canonical);
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, image, pathname]);
}
