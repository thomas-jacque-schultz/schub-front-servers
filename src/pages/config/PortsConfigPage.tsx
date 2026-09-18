import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PortForwardingCard from "../../components/PortForwardingCard";
import { PageHeader, Stack } from "../../design-system";
import { useAuthStore } from "../../stores/authStore";
import { usePortForwardingStore } from "../../stores/portForwardingStore";

/** Les redirections du routeur. `PORT_VIEW` pour lire, `PORT_RULE_EDIT` pour écrire. */
function PortsConfigPage() {
  const { t } = useTranslation("servers");
  const { accessToken, can } = useAuthStore();
  const {
    routerRules,
    staticRules,
    isLoading,
    error,
    loadPortForwarding,
    createStaticRule,
    deleteStaticRule,
  } = usePortForwardingStore();

  useEffect(() => {
    if (accessToken) {
      void loadPortForwarding(accessToken);
    }
  }, [accessToken, loadPortForwarding]);

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("config.eyebrow")}
        title={t("config.portsTitle")}
        subtitle={t("config.portsSubtitle")}
      />
      <PortForwardingCard
        routerRules={routerRules}
        staticRules={staticRules}
        isLoading={isLoading}
        error={error}
        canEdit={can("PORT_RULE_EDIT")}
        onRefresh={() => loadPortForwarding(accessToken)}
        onCreate={(rule) => createStaticRule(accessToken, rule)}
        onDelete={(id) => deleteStaticRule(accessToken, id)}
      />
    </Stack>
  );
}

export default PortsConfigPage;
