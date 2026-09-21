import { useTranslation } from "react-i18next";
import { Divider, Stack } from "../design-system";
import { FeedbackForm } from "./contact/FeedbackForm";
import { PortfolioSections } from "./contact/PortfolioSections";
import { useDocumentMeta } from "../seo/useDocumentMeta";

/**
 * `/contact` : qui je suis, puis comment me joindre.
 *
 * <p>Les deux étaient séparés — le portfolio à la racine, le formulaire ici. L'accueil est
 * devenu la page produit de Schub, et tout ce qui parle de la personne s'est regroupé ici, le
 * formulaire en bas. L'ordre n'est pas neutre : on lit avant d'écrire.</p>
 */
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
