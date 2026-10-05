import { useTranslation } from "react-i18next";
import { Card, Columns, Stack, Text } from "../../common";

const FEATURES = ["players", "team", "draft"] as const;
const QUESTIONS = ["duo", "premade", "games", "free"] as const;

/** Ce que fait PremadeLab, en texte : c'est aussi ce que lit un moteur de recherche sur l'accueil. */
export function HomeShowcase() {
  const { t } = useTranslation("lol");

  return (
    <Stack spacing={3}>
      <Columns minWidth={260}>
        {FEATURES.map((feature) => (
          <Card key={feature} title={t(`home.features.${feature}.title`)}>
            <Text>{t(`home.features.${feature}.body`)}</Text>
          </Card>
        ))}
      </Columns>
      <Card title={t("home.faq.title")}>
        <Stack spacing={2}>
          {QUESTIONS.map((question) => (
            <Stack key={question} spacing={0.5}>
              <Text variant="subtitle">
                {t(`home.faq.${question}.question`)}
              </Text>
              <Text>{t(`home.faq.${question}.answer`)}</Text>
            </Stack>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
