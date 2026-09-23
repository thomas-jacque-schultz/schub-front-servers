import { useTranslation } from "react-i18next";
import { Divider, Stack } from "../design-system";
import { FeedbackForm } from "./contact/FeedbackForm";
import { PortfolioSections } from "./contact/PortfolioSections";
import { useDocumentMeta } from "../seo/useDocumentMeta";

function ContactPage() {
  const { t } = useTranslation("contact");

  useDocumentMeta({ title: t("meta.title"), description: t("meta.description") });

  return (
    <Stack spacing={4}>
      <PortfolioSections />

      <Divider />

      <FeedbackForm />
    </Stack>
  );
}

export default ContactPage;
