import { useTranslation } from "react-i18next";
import {
  Card,
  FeedbackForm,
  Link,
  Stack,
  Text,
  useDocumentMeta,
} from "../../common";
import { SUPPORT_URL } from "../shell";

function ContactPage() {
  const { t } = useTranslation("contact");
  const { t: tLol } = useTranslation("lol");

  useDocumentMeta({
    title: t("feedbackMeta.title"),
    description: t("feedbackMeta.description"),
  });

  return (
    <Stack spacing={3}>
      <FeedbackForm />
      <Card title={tLol("support.title")}>
        <Stack spacing={1}>
          <Text tone="secondary">{tLol("support.text")}</Text>
          <Link href={SUPPORT_URL}>{tLol("support.action")}</Link>
        </Stack>
      </Card>
    </Stack>
  );
}

export default ContactPage;
