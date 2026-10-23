import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  HoneypotField,
  SelectField,
  Stack,
  Text,
  TextField,
} from "../design-system";
import { ApiError } from "../api/httpClient";
import {
  CONTACT_SUBJECTS,
  type ContactSubject,
  sendContactMessageApi,
} from "./contactApi";
import { TurnstileWidget } from "./TurnstileWidget";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 20;

// /contact?sujet=mini-jeux : le lien « Une question fausse ? » du quiz (Schub#136).
const SUJETS_DE_L_ADRESSE: Record<string, ContactSubject> = {
  compte: "ACCOUNT",
  "stats-fausses": "WRONG_STATS",
  fonctionnalite: "FEATURE",
  "mini-jeux": "MINI_GAMES",
  autre: "OTHER",
};

export function FeedbackForm() {
  const { t } = useTranslation("contact");
  const [params] = useSearchParams();

  const [subject, setSubject] = useState<ContactSubject | "">(
    () => SUJETS_DE_L_ADRESSE[params.get("sujet") ?? ""] ?? "",
  );
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

    if (!subject) {
      next.subject = t("errors.subjectRequired");
    }
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
        subject: subject || "OTHER",
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
      <Stack spacing={2}>
        <Text variant="title">{t("feedback.title")}</Text>
        <Alert severity="success" title={t("success.title")}>
          {t("success.body")}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Text variant="title">{t("feedback.title")}</Text>
      <Text tone="secondary">{t("feedback.intro")}</Text>

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

          <SelectField
            label={t("fields.subject")}
            value={subject}
            onChange={(value) => setSubject(value as ContactSubject)}
            options={CONTACT_SUBJECTS.map((code) => ({
              value: code,
              label: t(`subjects.${code}`),
            }))}
            error={Boolean(errors.subject)}
            helperText={errors.subject}
            required
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

          <HoneypotField
            name="website"
            label={t("fields.honeypot")}
            value={website}
            onChange={setWebsite}
          />

          <TurnstileWidget onToken={onToken} />

          <Stack
            direction="responsive"
            spacing={2}
            justify="between"
            align="center"
          >
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
