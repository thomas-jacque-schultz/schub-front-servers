import enAuth from "../locales/en/auth.json";
import enContact from "../locales/en/contact.json";
import enHome from "../locales/en/home.json";
import enCommon from "../locales/en/common.json";
import enDiscord from "../locales/en/discord.json";
import enPool from "../locales/en/pool.json";
import enPortfolio from "../locales/en/portfolio.json";
import enReviews from "../locales/en/reviews.json";
import enProfile from "../locales/en/profile.json";
import enPorts from "../locales/en/ports.json";
import enRoles from "../locales/en/roles.json";
import enServers from "../locales/en/servers.json";
import enStats from "../locales/en/stats.json";
import enTeams from "../locales/en/teams.json";
import enUsers from "../locales/en/users.json";
import frAuth from "../locales/fr/auth.json";
import frContact from "../locales/fr/contact.json";
import frHome from "../locales/fr/home.json";
import frCommon from "../locales/fr/common.json";
import frDiscord from "../locales/fr/discord.json";
import frPool from "../locales/fr/pool.json";
import frPortfolio from "../locales/fr/portfolio.json";
import frReviews from "../locales/fr/reviews.json";
import frProfile from "../locales/fr/profile.json";
import frPorts from "../locales/fr/ports.json";
import frRoles from "../locales/fr/roles.json";
import frServers from "../locales/fr/servers.json";
import frStats from "../locales/fr/stats.json";
import frTeams from "../locales/fr/teams.json";
import frUsers from "../locales/fr/users.json";

/**
 * Les catalogues, **un fichier par langue et par domaine**.
 *
 * <p>Ce découpage n'est pas cosmétique : deux fenêtres de travail qui touchent des écrans
 * différents modifient des fichiers différents et ne se marchent pas dessus. Ajouter un domaine,
 * c'est ajouter deux fichiers et deux lignes ici.</p>
 */
export const resources = {
  fr: {
    common: frCommon,
    auth: frAuth,
    servers: frServers,
    ports: frPorts,
    discord: frDiscord,
    users: frUsers,
    roles: frRoles,
    portfolio: frPortfolio,
    contact: frContact,
    home: frHome,
    teams: frTeams,
    profile: frProfile,
    stats: frStats,
    pool: frPool,
    reviews: frReviews,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    servers: enServers,
    ports: enPorts,
    discord: enDiscord,
    users: enUsers,
    roles: enRoles,
    portfolio: enPortfolio,
    contact: enContact,
    home: enHome,
    teams: enTeams,
    profile: enProfile,
    stats: enStats,
    pool: enPool,
    reviews: enReviews,
  },
} as const;

/** Le domaine implicite : `t("actions.back")` sans préfixe lit `common`. */
export const defaultNS = "common" as const;

export const namespaces = [
  "common",
  "auth",
  "servers",
  "ports",
  "discord",
  "users",
  "roles",
  "portfolio",
  "contact",
  "home",
  "teams",
  "profile",
  "stats",
  "pool",
  "reviews",
] as const;

export type Namespace = (typeof namespaces)[number];
