import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Card,
  HoneypotField,
  PageHeader,
  Stack,
  Text,
  TextField,
} from "../design-system";
import { ApiError } from "../api/httpClient";
import { sendContactMessageApi } from "../api/contactApi";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { useDocumentMeta } from "../seo/useDocumentMeta";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 20;

/**
 * Le formulaire de contact.
 *
 * <p>C'est la seule route publique du site qui déclenche une écriture, et le §4 du plan en tire
 * la conséquence : sans protection, le premier robot qui la trouve transforme une messagerie
 * Discord en boîte à spam — dont on ne se désabonne pas. Trois couches, dont deux visibles
 * ici : le champ leurre, et Turnstile <em>si</em> une clé est configurée. La troisième, la
 * limitation de débit par IP, est au BFF, où elle ne se contourne pas.</p>
 *
 * <p>La validation faite ici est un confort, pas une garantie : le BFF revalide tout. Un
 * formulaire qui n'attend pas l'aller-retour pour dire « il manque le message » est simplement
 * moins pénible.</p>
 */
function ContactPage() {
  const { t } = useTranslation("contact");

  useDocumentMeta({ title: t("meta.title"), description: t("meta.description") });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isSent, setSent] = useState(false);

  const onToken = useCallback((token: string) => setTurnstileToken(token), []);

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!name.trim()) {
      next.name = t("errors.nameRequired");
    }
    if (!email.trim()) {
      next.email = t("errors.emailRequired");
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = t("errors.emailInvalid");
    }
    if (!message.trim()) {
      next.message = t("errors.messageRequired");
    } else if (message.trim().length < MIN_MESSAGE_LENGTH) {
      next.message = t("errors.messageTooShort");
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setSendError("");
    if (!validate()) {
      return;
    }

    setSending(true);
    try {
      await sendContactMessageApi({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        website,
        turnstileToken: turnstileToken || undefined,
      });
      setSent(true);
    } catch (exception) {
      if (exception instanceof ApiError && exception.status === 429) {
        setSendError(t("errors.rateLimited"));
      } else if (exception instanceof ApiError && exception.status === 400) {
        setSendError(t("errors.rejected"));
      } else {
        setSendError(t("errors.failed"));
      }
    } finally {
      setSending(false);
    }
  };

  if (isSent) {
    return (
      <Stack spacing={3}>
        <PageHeader eyebrow={t("eyebrow")} title={t("title")} />
        <Alert severity="success" title={t("success.title")}>
          {t("success.body")}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <Card>
        <Stack spacing={3}>
          {sendError && <Alert severity="error">{sendError}</Alert>}

          <TextField
            label={t("fields.name")}
            value={name}
            onChange={setName}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            fullWidth
          />

          <TextField
            label={t("fields.email")}
            type="text"
            value={email}
            onChange={setEmail}
            error={Boolean(errors.email)}
            helperText={errors.email || t("helpers.email")}
            required
            fullWidth
          />

          <TextField
            label={t("fields.message")}
            value={message}
            onChange={setMessage}
            error={Boolean(errors.message)}
            helperText={errors.message || t("helpers.message")}
            required
            fullWidth
            multiline
            minRows={6}
          />

          {/* Hors de l'écran, hors de la tabulation. Un robot le remplit, le BFF rejette. */}
          <HoneypotField
            name="website"
            label={t("fields.honeypot")}
            value={website}
            onChange={setWebsite}
          />

          <TurnstileWidget onToken={onToken} />

          <Stack direction="responsive" spacing={2} justify="between" align="center">
            <Text variant="caption" tone="secondary">
              {t("privacy")}
            </Text>
            <Button onClick={() => void onSubmit()} loading={isSending}>
              {isSending ? t("sending") : t("submit")}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}

export default ContactPage;
