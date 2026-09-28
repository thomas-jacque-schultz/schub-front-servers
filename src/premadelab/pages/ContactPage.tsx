import { useTranslation } from "react-i18next";
import { FeedbackForm, useDocumentMeta } from "../../common";

function ContactPage() {
  const { t } = useTranslation("contact");

  useDocumentMeta({
    title: t("feedbackMeta.title"),
    description: t("feedbackMeta.description"),
  });

  return <FeedbackForm />;
}

export default ContactPage;
