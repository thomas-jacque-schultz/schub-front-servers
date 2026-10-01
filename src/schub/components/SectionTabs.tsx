import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import {
  LocalizedNavigate,
  Tabs,
  pathWithoutLanguage,
  useAuthStore,
  useLocalizedNavigate,
} from "../../common";
import { type Section, visibleTabs } from "../sections";

export function SectionTabs({ section }: { section: Section }) {
  const { t } = useTranslation();
  const { connected, canAny } = useAuthStore();
  const navigate = useLocalizedNavigate();
  const route = pathWithoutLanguage(useLocation().pathname);

  const tabs = visibleTabs(section, canAny);
  const current = tabs.find((tab) => tab.path === route);

  if (!current) {
    // Onglet sans droit : la garde de sa route décide.
    if (section.tabs.some((tab) => tab.path === route)) {
      return <Outlet />;
    }
    if (tabs.length > 0) {
      return <LocalizedNavigate to={tabs[0].path} replace />;
    }
    return <LocalizedNavigate to={connected ? "/" : "/login"} replace />;
  }

  if (tabs.length < 2) {
    return <Outlet />;
  }

  return (
    <Tabs
      items={tabs.map((tab) => ({ key: tab.key, label: t(tab.labelKey) }))}
      value={current.key}
      onChange={(key) => {
        const next = tabs.find((tab) => tab.key === key);
        if (next) {
          navigate(next.path);
        }
      }}
      ariaLabel={t(section.labelKey)}
    >
      <Outlet />
    </Tabs>
  );
}
