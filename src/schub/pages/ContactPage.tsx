import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { LocalizedNavigate, useDocumentMeta } from "../../common";
import { PortfolioSections } from "./contact/PortfolioSections";

function ContactPage() {
  const { t } = useTranslation("contact");

  const { hash } = useLocation();

  useDocumentMeta({
    title: t("meta.title"),
    description: t("meta.description"),
  });

  // Les liens partagés avant que le feedback ait sa propre page.
  if (hash === "#feedback") {
    return <LocalizedNavigate to="/feedback" replace />;
  }

  return <PortfolioSections />;
}

export default ContactPage;
