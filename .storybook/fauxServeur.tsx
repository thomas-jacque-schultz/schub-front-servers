import { useEffect } from "react";
import type { Decorator } from "@storybook/react";

// Storybook est public et n'a pas d'API derrière lui : une story qui appelle /api reçoit ces réponses-là, fictives.
type Route = (url: URL) => Response | Promise<Response> | undefined;

const FETCH_ORIGINAL = window.fetch.bind(window);

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const enAttente = (): Promise<Response> =>
  new Promise<Response>(() => {});

export const fauxServeur =
  (route: Route): Decorator =>
  (Story) => {
    window.fetch = (async (input: RequestInfo | URL) => {
      const brute =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const reponse = await route(new URL(brute, window.location.origin));
      return reponse ?? new Response(null, { status: 404 });
    }) as typeof window.fetch;
    useEffect(
      () => () => {
        window.fetch = FETCH_ORIGINAL;
      },
      [],
    );
    return <Story />;
  };
