import type { ParseKeys } from "i18next";
import type { Permission } from "../common";

type ShellLabel = Extract<ParseKeys<"common">, `shell.${string}`>;

export interface SectionTab {
  key: string;
  /** Chemin de l'onglet, sans la langue. */
  path: string;
  labelKey: ShellLabel;
  /** Absent : visible de tous, visiteurs compris. */
  permissions?: Permission[];
}

export interface Section {
  key: "servers" | "premadelab" | "admin";
  path: string;
  labelKey: ShellLabel;
  tabs: SectionTab[];
}

export const SECTIONS: Section[] = [
  {
    key: "servers",
    path: "/servers",
    labelKey: "shell.gameServers",
    tabs: [
      { key: "list", path: "/servers", labelKey: "shell.tabServers" },
      {
        key: "ports",
        path: "/servers/ports",
        labelKey: "shell.tabPorts",
        permissions: ["PORT_VIEW"],
      },
      {
        key: "discord",
        path: "/servers/discord",
        labelKey: "shell.tabDiscord",
        permissions: ["DISCORD_CHANNEL_MANAGE"],
      },
    ],
  },
  {
    key: "premadelab",
    path: "/premadelab",
    labelKey: "shell.appPremadelab",
    tabs: [
      {
        key: "settings",
        path: "/premadelab/settings",
        labelKey: "shell.tabSettings",
        permissions: ["INGEST_VIEW"],
      },
      {
        key: "ingest",
        path: "/premadelab/ingest",
        labelKey: "shell.tabIngest",
        permissions: ["INGEST_VIEW"],
      },
      {
        key: "research",
        path: "/premadelab/research",
        labelKey: "shell.tabResearch",
        permissions: ["AUGUR_PATTERN_EDIT", "INGEST_MANAGE"],
      },
    ],
  },
  {
    key: "admin",
    path: "/admin",
    labelKey: "shell.admin",
    tabs: [
      {
        key: "users",
        path: "/admin/users",
        labelKey: "shell.tabUsers",
        permissions: ["USER_VIEW"],
      },
      {
        key: "roles",
        path: "/admin/roles",
        labelKey: "shell.tabRoles",
        permissions: ["ROLE_MANAGE"],
      },
    ],
  },
];

export function visibleTabs(
  section: Section,
  canAny: (...permissions: Permission[]) => boolean,
): SectionTab[] {
  return section.tabs.filter(
    (tab) => !tab.permissions || canAny(...tab.permissions),
  );
}
