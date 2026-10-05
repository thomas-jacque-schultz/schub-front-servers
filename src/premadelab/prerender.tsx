import { StrictMode } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router-dom/server";
import {
  AppThemeProvider,
  AuthStoreProvider,
  ProductProvider,
  ProfileStoreProvider,
  i18n,
  takePrerenderedMeta,
  type AppLanguage,
} from "../common";
import App from "./App";

export interface PrerenderedPage {
  html: string;
  title: string | null;
  description: string | null;
}

/** Rend une page publique pour un visiteur anonyme ; scripts/prerender.mjs l'écrit dans dist/. */
export async function render(
  url: string,
  language: AppLanguage,
): Promise<PrerenderedPage> {
  await i18n.changeLanguage(language);
  takePrerenderedMeta();
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <AppThemeProvider>
        <ProductProvider name="PremadeLab">
          <StaticRouter location={url}>
            <AuthStoreProvider anonymous>
              <ProfileStoreProvider>
                <App />
              </ProfileStoreProvider>
            </AuthStoreProvider>
          </StaticRouter>
        </ProductProvider>
      </AppThemeProvider>
    </StrictMode>,
  );
  const decoder = new TextDecoder();
  let html = "";
  for await (const chunk of prelude) {
    html +=
      typeof chunk === "string"
        ? chunk
        : decoder.decode(chunk as Uint8Array, { stream: true });
  }
  html += decoder.decode();
  const meta = takePrerenderedMeta();
  return {
    html,
    title: meta?.title ?? null,
    description: meta?.description ?? null,
  };
}
