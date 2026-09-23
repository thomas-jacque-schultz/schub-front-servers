import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PortForwardingCard from "../../components/PortForwardingCard";
import { PageHeader, Stack } from "../../design-system";
import { useAuthStore } from "../../stores/authStore";
import { usePortForwardingStore } from "../../stores/portForwardingStore";

function PortsConfigPage() {
  const { t } = useTranslation("servers");
  const { can } = useAuthStore();
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
    void loadPortForwarding();
  }, [loadPortForwarding]);

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
        onRefresh={() => loadPortForwarding()}
        onCreate={(rule) => createStaticRule(rule)}
        onDelete={(id) => deleteStaticRule(id)}
      />
    </Stack>
  );
}

export default PortsConfigPage;
