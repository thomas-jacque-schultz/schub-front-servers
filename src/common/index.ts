// Le pacte de src/common : Schub et PremadeLab n'en voient que ce que ce fichier exporte.
// Un changement de pacte se lit donc dans le diff de ce fichier.
import "./i18n";

export * from "./design-system";

export { default as i18n } from "./i18n";
export { pathWithoutLanguage } from "./i18n/config";
export type { AppLanguage } from "./i18n/config";
export { useLocaleFormat } from "./i18n/format";
export { LocalizedNavigate } from "./i18n/LocalizedNavigate";
export { LocalizedRoot } from "./i18n/LocalizedRoot";
export {
  useCurrentLanguage,
  useLocalizedNavigate,
  useLocalizedPath,
} from "./i18n/navigation";

export { useDocumentMeta } from "./seo/useDocumentMeta";
export { RequireAuth, RequirePermission } from "./routing/guards";
export { lazyPage } from "./routing/lazyPage";

export { ApiError, requestJson } from "./api/httpClient";
export { messageOf, useRequest } from "./api/useRequest";
export { getHistoryWindowApi, useHistoryWindow } from "./api/historyWindowApi";
export type { HistoryWindowDto } from "./api/historyWindowApi";

export { AuthStoreProvider, useAuthStore } from "./stores/authStore";
export { ProfileStoreProvider, useProfileStore } from "./stores/profileStore";

export {
  ASSIGNABLE_PERMISSIONS,
  OWNER_ROLE_NAME,
  RESERVED_PERMISSION,
} from "./types/permission";
export type { Permission } from "./types/permission";
export type { AccountLinks } from "./types/auth";
export type { KnownRiotAccountDto } from "./types/profile";

export { FeedbackForm } from "./contact/FeedbackForm";
export { RiotAccountPicker } from "./riot/RiotAccountPicker";
export { RiotDisclaimer } from "./riot/RiotDisclaimer";

export { APP_URLS } from "./apps";
export { ProductProvider, useProductName } from "./product";
export { LoginPage, PrivacyPage, ProfilePage, TermsPage } from "./pages";
