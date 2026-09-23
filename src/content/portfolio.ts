import type { AppLanguage } from "../i18n/config";

export interface PortfolioLink {
  key: string;
  label: string;
  href: string | null;
}

export interface PortfolioProject {
  key: string;
  name: string;
  tagline: string;
  body: string[];
  stack: string[];
  links: PortfolioLink[];
}

export interface PortfolioRole {
  key: string;
  period: string;
  title: string;
  organisation: string;
  place: string;
  summary: string | null;
  current?: boolean;
}

export interface PortfolioEducation {
  key: string;
  period: string;
  title: string;
  place: string;
}

export interface PortfolioLanguageSkill {
  key: string;
  name: string;
  level?: string;
}

export interface PortfolioContent {
  hero: {
    eyebrow: string;
    name: string;
    title: string;
    lede: string;
    body: string;
    ctaServers: string;
  };
  currentRoleGap: {
    heading: string;
    placeholder: string;
  };
  sections: {
    projects: { title: string; intro: string };
    experience: { title: string; intro: string };
    education: { title: string };
    languages: { title: string };
  };
  portrait: {
    src: string | null;
    alt: string;
  };
  projects: PortfolioProject[];
  experience: PortfolioRole[];
  education: PortfolioEducation[];
  languages: PortfolioLanguageSkill[];
  repositoryUrl: string | null;
}

const REPOSITORY_URL = "https://github.com/thomas-jacque-schultz";

const PLAN_URL = `${REPOSITORY_URL}/Schub/blob/main/docs/evolutions-2026-09.md`;
const MIGRATION_URL = `${REPOSITORY_URL}/Schub/blob/main/docs/migration-microservices.md`;

const fr: PortfolioContent = {
  hero: {
    eyebrow: "Ingénieur full stack",
    name: "Thomas Schultz",
    title: "Je construis du logiciel métier qui tourne en production",
    lede:
      "Quatre ans d'ingénierie full stack sans interruption, d'abord en ESN puis chez deux " +
      "industriels : l'automobile avec Stellantis, l'édition scolaire avec Poplab, aujourd'hui " +
      "les engins miniers chez Liebherr.",
    body:
      "Ce n'est pas une collection de missions. C'est le même métier exercé dans trois " +
      "environnements contraints : des utilisateurs qui ne peuvent pas attendre, des systèmes " +
      "existants qu'on ne remplace pas d'un coup, et des décisions techniques qu'il faut savoir " +
      "justifier. Ce que je préfère montrer, ce n'est pas une liste de technologies : c'est du " +
      "code qui tourne, et les raisons écrites des choix qu'il porte.",
    ctaServers: "Voir les serveurs en direct",
  },
  currentRoleGap: {
    heading: "Aujourd'hui",
    placeholder:
      "[À COMPLÉTER — deux ou trois phrases sur le poste actuel chez Liebherr Mining, avec la " +
      "pile réellement employée. C'est le premier paragraphe que lit un visiteur : la page ne " +
      "se publie pas tant que ce texte est affiché.]",
  },
  sections: {
    projects: {
      title: "Ce que je construis",
      intro:
        "Des projets personnels, mais tenus comme du travail : intégration continue, revue, " +
        "documentation d'architecture, et la production comme juge de paix.",
    },
    experience: {
      title: "Parcours",
      intro: "Le détail chronologique, pour qui veut le lire après les projets.",
    },
    education: { title: "Formation" },
    languages: { title: "Langues" },
  },
  portrait: { src: null, alt: "Portrait de Thomas Schultz" },
  projects: [
    {
      key: "schub",
      name: "Schub",
      tagline: "La boîte à outils de la communauté Miam — serveurs de jeu, équipes League of Legends —, en production.",
      body: [
        "Sept dépôts, un cœur métier et quatre connecteurs, déployés en Docker Swarm derrière " +
          "un tunnel Cloudflare. L'interface est un SPA React bilingue adossé à un BFF Spring " +
          "Boot ; l'identité passe par Discord, sans compte local.",
        "Un bot Discord relaie les commandes et les changements d'état dans les salons abonnés. " +
          "Les redirections de ports de la box ne sont pas ouvertes à la main : un connecteur " +
          "les réconcilie par API à partir de l'état déclaré des serveurs, ce qui les rend " +
          "reproductibles et révocables.",
        "Ce qui m'intéresse le plus dans ce projet n'est pas le code mais les deux documents " +
          "d'architecture qui l'accompagnent : la découpe en microservices y est argumentée, " +
          "datée, et corrigée aux endroits où la vérification a contredit le plan initial.",
      ],
      stack: [
        "Java 21",
        "Spring Boot",
        "React",
        "TypeScript",
        "MongoDB",
        "Docker Swarm",
        "Cloudflare",
        "JDA",
      ],
      links: [
        { key: "repo", label: "Les dépôts", href: REPOSITORY_URL },
        { key: "plan", label: "Le plan des évolutions", href: PLAN_URL },
        { key: "migration", label: "La découpe en microservices", href: MIGRATION_URL },
      ],
    },
    {
      key: "design-system",
      name: "Le design system de Schub",
      tagline: "Une contrainte outillée, pas une bibliothèque de composants de plus.",
      body: [
        "Vingt primitives documentées dans un Storybook public. L'intérêt n'est pas la " +
          "collection : c'est la règle ESLint qui interdit d'importer MUI ailleurs que dans le " +
          "design system, et qui fait échouer la compilation d'un écran qui contourne.",
        "Un Storybook seul documente ; il ne force rien. Ce qui force, c'est un verrou dans la " +
          "chaîne de construction — et il tient en vingt lignes de configuration.",
      ],
      stack: ["Storybook", "MUI", "ESLint", "react-i18next"],
      links: [{ key: "storybook", label: "Consulter le Storybook", href: "/storybook" }],
    },
  ],
  experience: [
    {
      key: "liebherr",
      period: "nov. 2024 — aujourd'hui",
      title: "Ingénieur full stack",
      organisation: "Liebherr Mining",
      place: "Colmar",
      summary: null,
      current: true,
    },
    {
      key: "lde",
      period: "juil. 2023 — nov. 2024",
      title: "Ingénieur full stack",
      organisation: "Librairie LDE — projet Poplab",
      place: "Molsheim",
      summary: null,
    },
    {
      key: "sfeir-stellantis",
      period: "sept. 2021 — juil. 2023",
      title: "Ingénieur full stack",
      organisation: "SFEIR — projet Stellantis",
      place: "Strasbourg",
      summary: null,
    },
    {
      key: "sfeir-sidel",
      period: "févr. — sept. 2021",
      title: "Stage de fin d'études",
      organisation: "SFEIR — projet Sidel",
      place: "Strasbourg",
      summary: null,
    },
    {
      key: "sdis",
      period: "juil. 2020",
      title: "Stage",
      organisation: "SDIS 67 — service GUNSI",
      place: "Wolfisheim",
      summary: null,
    },
    {
      key: "eps",
      period: "juil. — sept. 2017",
      title: "Agent de centre d'appels",
      organisation: "Euro Protection Surveillance",
      place: "Illkirch",
      summary: null,
    },
  ],
  education: [
    {
      key: "ensisa",
      period: "2018 — 2021",
      title: "Diplôme d'ingénieur en informatique, ENSISA",
      place: "Mulhouse",
    },
    {
      key: "aalen",
      period: "2018",
      title: "Semestre d'échange, Fachhochschule Aalen",
      place: "Aalen, Allemagne",
    },
    {
      key: "iut",
      period: "2016 — 2018",
      title: "DUT informatique, IUT Robert Schuman",
      place: "Illkirch",
    },
    { key: "mpsi", period: "2015 — 2016", title: "MPSI, lycée Kléber", place: "Strasbourg" },
  ],
  languages: [
    { key: "fr", name: "Français", level: "Langue maternelle" },
    { key: "en", name: "Anglais", level: "Professionnel complet" },
    { key: "de", name: "Allemand", level: "Professionnel" },
    { key: "als", name: "Alsacien" },
  ],
  repositoryUrl: REPOSITORY_URL,
};

const en: PortfolioContent = {
  hero: {
    eyebrow: "Full stack engineer",
    name: "Thomas Schultz",
    title: "I build business software that runs in production",
    lede:
      "Four uninterrupted years of full stack engineering — first in consulting, then inside " +
      "two industrial companies: automotive with Stellantis, educational publishing with " +
      "Poplab, and today mining equipment at Liebherr.",
    body:
      "This is not a collection of assignments. It is the same craft practised in three " +
      "constrained environments: users who cannot wait, legacy systems that will not be " +
      "replaced in one go, and technical decisions that have to be justified out loud. What I " +
      "would rather show is not a list of technologies but working code — and the written " +
      "reasons behind the choices it carries.",
    ctaServers: "See the servers live",
  },
  currentRoleGap: {
    heading: "Right now",
    placeholder:
      "[TO BE WRITTEN — two or three sentences about the current role at Liebherr Mining, with " +
      "the actual stack. This is the first paragraph a visitor reads: the page does not go live " +
      "while this text is on screen.]",
  },
  sections: {
    projects: {
      title: "What I build",
      intro:
        "Side projects, run like real work: continuous integration, review, written " +
        "architecture decisions — and production as the final judge.",
    },
    experience: {
      title: "Career",
      intro: "The chronology, for whoever wants it after the projects.",
    },
    education: { title: "Education" },
    languages: { title: "Languages" },
  },
  portrait: { src: null, alt: "Portrait of Thomas Schultz" },
  projects: [
    {
      key: "schub",
      name: "Schub",
      tagline: "The Miam community toolkit — game servers, League of Legends teams — running in production.",
      body: [
        "Seven repositories — one business core and four connectors — deployed on Docker Swarm " +
          "behind a Cloudflare tunnel. The interface is a bilingual React SPA backed by a Spring " +
          "Boot BFF; identity goes through Discord, with no local accounts at all.",
        "A Discord bot relays commands and status changes into subscribed channels. Router port " +
          "forwarding is not opened by hand: a connector reconciles it through the ISP box API " +
          "from the servers' declared state, which makes it reproducible and revocable.",
        "What interests me most here is not the code but the two architecture documents that " +
          "come with it: the split into microservices is argued, dated, and corrected wherever " +
          "verification contradicted the original plan.",
      ],
      stack: [
        "Java 21",
        "Spring Boot",
        "React",
        "TypeScript",
        "MongoDB",
        "Docker Swarm",
        "Cloudflare",
        "JDA",
      ],
      links: [
        { key: "repo", label: "The repositories", href: REPOSITORY_URL },
        { key: "plan", label: "The evolution plan", href: PLAN_URL },
        { key: "migration", label: "The microservices split", href: MIGRATION_URL },
      ],
    },
    {
      key: "design-system",
      name: "Schub's design system",
      tagline: "An enforced constraint, not one more component library.",
      body: [
        "Twenty primitives documented in a public Storybook. The point is not the collection: " +
          "it is the ESLint rule forbidding MUI imports anywhere but the design system, which " +
          "fails the build of any screen that works around it.",
        "A Storybook on its own documents; it enforces nothing. What enforces is a lock in the " +
          "build chain — and it fits in twenty lines of configuration.",
      ],
      stack: ["Storybook", "MUI", "ESLint", "react-i18next"],
      links: [{ key: "storybook", label: "Browse the Storybook", href: "/storybook" }],
    },
  ],
  experience: [
    {
      key: "liebherr",
      period: "Nov. 2024 — present",
      title: "Full stack engineer",
      organisation: "Liebherr Mining",
      place: "Colmar, France",
      summary: null,
      current: true,
    },
    {
      key: "lde",
      period: "Jul. 2023 — Nov. 2024",
      title: "Full stack engineer",
      organisation: "Librairie LDE — Poplab",
      place: "Molsheim, France",
      summary: null,
    },
    {
      key: "sfeir-stellantis",
      period: "Sep. 2021 — Jul. 2023",
      title: "Full stack engineer",
      organisation: "SFEIR — Stellantis",
      place: "Strasbourg, France",
      summary: null,
    },
    {
      key: "sfeir-sidel",
      period: "Feb. — Sep. 2021",
      title: "Final-year internship",
      organisation: "SFEIR — Sidel",
      place: "Strasbourg, France",
      summary: null,
    },
    {
      key: "sdis",
      period: "Jul. 2020",
      title: "Internship",
      organisation: "SDIS 67 — GUNSI department",
      place: "Wolfisheim, France",
      summary: null,
    },
    {
      key: "eps",
      period: "Jul. — Sep. 2017",
      title: "Call centre agent",
      organisation: "Euro Protection Surveillance",
      place: "Illkirch, France",
      summary: null,
    },
  ],
  education: [
    {
      key: "ensisa",
      period: "2018 — 2021",
      title: "Engineering degree in computer science, ENSISA",
      place: "Mulhouse, France",
    },
    {
      key: "aalen",
      period: "2018",
      title: "Exchange semester, Fachhochschule Aalen",
      place: "Aalen, Germany",
    },
    {
      key: "iut",
      period: "2016 — 2018",
      title: "Two-year technical degree in computer science, IUT Robert Schuman",
      place: "Illkirch, France",
    },
    {
      key: "mpsi",
      period: "2015 — 2016",
      title: "MPSI preparatory class, Lycée Kléber",
      place: "Strasbourg, France",
    },
  ],
  languages: [
    { key: "fr", name: "French", level: "Native" },
    { key: "en", name: "English", level: "Full professional" },
    { key: "de", name: "German", level: "Professional" },
    { key: "als", name: "Alsatian" },
  ],
  repositoryUrl: REPOSITORY_URL,
};

export const PORTFOLIO: Record<AppLanguage, PortfolioContent> = { fr, en };

// Adresse e-mail volontairement non publiée : le formulaire de contact en tient lieu.
export const PUBLISHES_EMAIL = false;
