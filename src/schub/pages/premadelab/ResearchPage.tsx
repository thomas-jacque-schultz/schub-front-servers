import { useTranslation } from "react-i18next";
import { Card, PageHeader, Stack, useAuthStore } from "../../../common";
import { AugurTrace } from "../../components/AugurTrace";
import { PatternEditor } from "../../components/PatternEditor";

function ResearchPage() {
  const { t } = useTranslation("riot");
  const { can } = useAuthStore();

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow={t("ingest.eyebrow")}
        title={t("research.title")}
        subtitle={t("research.subtitle")}
      />
      {can("AUGUR_PATTERN_EDIT") && <PatternEditor />}
      {can("INGEST_MANAGE") && (
        <Card
          title={t("ingest.debug.title")}
          description={t("ingest.debug.empty")}
        >
          <AugurTrace />
        </Card>
      )}
    </Stack>
  );
}

export default ResearchPage;
