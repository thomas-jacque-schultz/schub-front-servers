import { lazyPage } from "./routing/lazyPage";

// Communes aux deux applications : chacune les monte dans ses routes.
export const ProfilePage = lazyPage(() => import("./profile/ProfilePage"));
export const TermsPage = lazyPage(() => import("./legal/TermsPage"));
export const PrivacyPage = lazyPage(() => import("./legal/PrivacyPage"));
export const LoginPage = lazyPage(() => import("./auth/LoginPage"));
