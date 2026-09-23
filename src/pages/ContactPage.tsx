import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Divider, Stack } from "../design-system";
import { FeedbackForm } from "./contact/FeedbackForm";
import { PortfolioSections } from "./contact/PortfolioSections";
import { useDocumentMeta } from "../seo/useDocumentMeta";

function ContactPage() {
  const { t } = useTranslation("contact");

  const { hash } = useLocation();

  useDocumentMeta({ title: t("meta.title"), description: t("meta.description") });

  // Le routeur ne suit pas les ancres : le lien « Feedback » du pied de page atterrirait en haut.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  return (
    <Stack spacing={4}>
      <PortfolioSections />

      <Divider />

      <Stack id="feedback">
        <FeedbackForm />
      </Stack>
    </Stack>
  );
}

export default ContactPage;
