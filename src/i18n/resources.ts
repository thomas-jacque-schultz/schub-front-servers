import enAuth from "../locales/en/auth.json";
import enContact from "../locales/en/contact.json";
import enLegal from "../locales/en/legal.json";
import enLol from "../locales/en/lol.json";
import enHome from "../locales/en/home.json";
import enCommon from "../locales/en/common.json";
import enDiscord from "../locales/en/discord.json";
import enPool from "../locales/en/pool.json";
import enPortfolio from "../locales/en/portfolio.json";
import enReviews from "../locales/en/reviews.json";
import enRiot from "../locales/en/riot.json";
import enProfile from "../locales/en/profile.json";
import enPorts from "../locales/en/ports.json";
import enRoles from "../locales/en/roles.json";
import enServers from "../locales/en/servers.json";
import enStats from "../locales/en/stats.json";
import enTeams from "../locales/en/teams.json";
import enUsers from "../locales/en/users.json";
import frAuth from "../locales/fr/auth.json";
import frContact from "../locales/fr/contact.json";
import frLegal from "../locales/fr/legal.json";
import frLol from "../locales/fr/lol.json";
import frHome from "../locales/fr/home.json";
import frCommon from "../locales/fr/common.json";
import frDiscord from "../locales/fr/discord.json";
import frPool from "../locales/fr/pool.json";
import frPortfolio from "../locales/fr/portfolio.json";
import frReviews from "../locales/fr/reviews.json";
import frRiot from "../locales/fr/riot.json";
import frProfile from "../locales/fr/profile.json";
import frPorts from "../locales/fr/ports.json";
import frRoles from "../locales/fr/roles.json";
import frServers from "../locales/fr/servers.json";
import frStats from "../locales/fr/stats.json";
import frTeams from "../locales/fr/teams.json";
import frUsers from "../locales/fr/users.json";

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
    riot: frRiot,
    legal: frLegal,
    lol: frLol,
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
    riot: enRiot,
    legal: enLegal,
    lol: enLol,
  },
} as const;

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
  "riot",
  "legal",
  "lol",
] as const;

export type Namespace = (typeof namespaces)[number];
