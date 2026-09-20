import { useTranslation } from "react-i18next";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Link,
  PageHeader,
  Stack,
  Text,
} from "../design-system";
import { PORTFOLIO } from "../content/portfolio";
import { useCurrentLanguage, useLocalizedNavigate, useLocalizedPath } from "../i18n/navigation";
import { useDocumentMeta } from "../seo/useDocumentMeta";

/**
 * La racine du domaine : une page d'ingénieur, pas un CV.
 *
 * <p>Le ton est tranché au §9 du plan : <em>montrer ce qu'on construit</em>, le parcours en
 * second rideau. L'ordre des blocs en découle — l'accroche, puis les projets, puis seulement la
 * chronologie. Un CV commence par l'inverse, et c'est pour ça qu'il ne retient personne sur une
 * page d'accueil.</p>
 *
 * <p>Elle ne contient <strong>aucun texte</strong> : tout vient de `src/content/portfolio.ts`.
 * C'est ce qui garde le pré-rendu de `/` possible plus tard sans réécrire cette page.</p>
 */
function PortfolioPage() {
  const { t } = useTranslation("portfolio");
  const language = useCurrentLanguage();
  const navigate = useLocalizedNavigate();
  const localize = useLocalizedPath();
  const content = PORTFOLIO[language];

  useDocumentMeta({ title: content.meta.title, description: content.meta.description });

  return (
    <Stack spacing={4}>
      <Stack direction="responsive" spacing={3} align="start">
        {/* La colonne du portrait ne se dessine que si une photo existe. Voir `portrait` dans le
            contenu : la place est réservée dans le code, pas par un cadre vide à l'écran. */}
        {content.portrait.src && (
          <Avatar src={content.portrait.src} name={content.portrait.alt} size="medium" />
        )}
        <Stack spacing={3}>
          <PageHeader
            eyebrow={content.hero.eyebrow}
            title={content.hero.name}
            subtitle={content.hero.title}
          />
          <Text variant="subtitle">{content.hero.lede}</Text>
          <Text>{content.hero.body}</Text>
          <Stack direction="responsive" spacing={1.5}>
            <Button onClick={() => navigate("/contact")}>{content.hero.ctaContact}</Button>
            <Button variant="secondary" onClick={() => navigate("/servers")}>
              {content.hero.ctaServers}
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Le seul paragraphe manquant, affiché et signalé. Tant que cette alerte est là, la page
          n'est pas publiable — c'est le premier bloc que lit un visiteur. */}
      <Alert severity="warning" title={content.currentRoleGap.heading}>
        {content.currentRoleGap.placeholder}
      </Alert>

      <Stack spacing={2}>
        <Text variant="title">{content.sections.projects.title}</Text>
        <Text tone="secondary">{content.sections.projects.intro}</Text>

        {content.projects.map((project) => (
          <Card key={project.key} title={project.name} description={project.tagline}>
            <Stack spacing={2}>
              {project.body.map((paragraph, index) => (
                <Text key={`${project.key}-p${index}`}>{paragraph}</Text>
              ))}

              <Stack direction="row" spacing={1} wrap>
                {project.stack.map((item) => (
                  <Chip key={item} label={item} variant="outline" />
                ))}
              </Stack>

              <Stack direction="row" spacing={2} wrap>
                {project.links.map((link) =>
                  link.href ? (
                    <Link
                      key={link.key}
                      href={link.href.startsWith("/") ? localize(link.href) : link.href}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Text key={link.key} variant="caption" tone="disabled">
                      {link.label} — {t("pendingLink")}
                    </Text>
                  ),
                )}
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Stack spacing={2}>
        <Text variant="title">{content.sections.experience.title}</Text>
        <Text tone="secondary">{content.sections.experience.intro}</Text>

        <Card>
          <Stack spacing={2}>
            {content.experience.map((role, index) => (
              <Stack key={role.key} spacing={2}>
                {index > 0 && <Divider />}
                <Stack direction="responsive" spacing={2} justify="between" align="start">
                  <Stack spacing={0.5}>
                    <Text variant="subtitle">{role.title}</Text>
                    <Text variant="caption" tone="secondary">
                      {role.organisation} · {role.place}
                    </Text>
                    {role.summary && <Text variant="caption">{role.summary}</Text>}
                  </Stack>
                  <Stack direction="row" spacing={1} align="center">
                    {role.current && <Chip tone="primary" label={t("currentRole")} />}
                    <Text variant="caption" tone="secondary">
                      {role.period}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>
      </Stack>

      <Stack direction="responsive" spacing={3} align="stretch">
        <Card title={content.sections.education.title}>
          <Stack spacing={2}>
            {content.education.map((step) => (
              <Stack key={step.key} spacing={0.5}>
                <Text variant="caption">{step.title}</Text>
                <Text variant="caption" tone="secondary">
                  {step.period} · {step.place}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card title={content.sections.languages.title}>
          <Stack spacing={1} wrap direction="row">
            {content.languages.map((entry) => (
              <Chip
                key={entry.key}
                variant="outline"
                label={entry.level ? `${entry.name} — ${entry.level}` : entry.name}
              />
            ))}
          </Stack>
        </Card>
      </Stack>

      <Card title={content.sections.contact.title} description={content.sections.contact.intro}>
        <Stack direction="row" spacing={2}>
          <Button onClick={() => navigate("/contact")}>{content.sections.contact.cta}</Button>
        </Stack>
      </Card>
    </Stack>
  );
}

export default PortfolioPage;
