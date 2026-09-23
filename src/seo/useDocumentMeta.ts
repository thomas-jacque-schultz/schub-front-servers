import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface DocumentMeta {
  title: string;
  description: string;
  image?: string;
}

const MARKER = "data-schub-meta";

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
