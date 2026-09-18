import { type ReactNode, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MuiButton from "@mui/material/Button";
import MuiStack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Button } from "./Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeModeToggle } from "./ThemeModeToggle";

export interface AppShellNavItem {
  key: string;
  label: string;
  /** Chemin **déjà localisé** : la coquille ne connaît pas la règle des préfixes de langue. */
  to: string;
}

export interface AppShellMenu {
  key: string;
  label: string;
  items: AppShellNavItem[];
}

export interface AppShellFooterLink {
  key: string;
  label: string;
  /** Absente, l'entrée s'affiche inerte et annoncée comme à compléter. */
  href?: string | null;
  /** Ce qu'on lit au survol d'une entrée sans adresse. */
  pendingLabel?: string;
  /** Faux pour un lien interne au site (le Storybook, servi sous le même domaine). */
  external?: boolean;
}

export interface AppShellProps {
  brand: string;
  brandTo: string;
  brandTagline?: string;
  navItems?: AppShellNavItem[];
  /** Les menus déroulants — *Configuration*, et ce que le chantier C y ajoutera. */
  menus?: AppShellMenu[];
  connected: boolean;
  username?: string | null;
  signInLabel: string;
  signOutLabel: string;
  connectedAsLabel?: string;
  onSignIn: () => void;
  onSignOut: () => void;
  footerLinks: AppShellFooterLink[];
  footerNote?: ReactNode;
  maxWidth?: "md" | "lg";
  children: ReactNode;
}

/**
 * La coquille de l'application : un en-tête, le contenu, un pied de page.
 *
 * <p>Elle manquait au chantier B parce qu'elle dépend de l'authentification. Elle devient le
 * cadre de tous les écrans, et c'est elle qui rend vraie la règle « un menu qui mène à un 403
 * est un menu de trop » : <strong>elle n'affiche que ce qu'on lui donne</strong>, et c'est
 * l'appelant, qui connaît les permissions, qui décide ce qu'il lui donne. Aucune permission
 * n'est testée ici — le design system ne connaît pas le modèle de droits.</p>
 *
 * <p>Le pied de page accepte des liens **sans adresse** : ils s'affichent inertes et signalés
 * comme à compléter, plutôt que de disparaître. Un lien manquant qu'on voit finit par être
 * fourni ; un lien supprimé est oublié.</p>
 */
export function AppShell({
  brand,
  brandTo,
  brandTagline,
  navItems = [],
  menus = [],
  connected,
  username,
  signInLabel,
  signOutLabel,
  connectedAsLabel,
  onSignIn,
  onSignOut,
  footerLinks,
  footerNote,
  maxWidth = "lg",
  children,
}: AppShellProps) {
  const { pathname } = useLocation();
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const closeMenu = () => {
    setOpenMenuKey(null);
    setAnchor(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(8px)" }}>
        <Container maxWidth={maxWidth}>
          <Toolbar disableGutters sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
            <MuiStack
              component={RouterLink}
              to={brandTo}
              spacing={0}
              sx={{ textDecoration: "none", color: "inherit", mr: 2 }}
            >
              <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
                {brand}
              </Typography>
              {brandTagline && (
                <Typography variant="caption" color="text.secondary">
                  {brandTagline}
                </Typography>
              )}
            </MuiStack>

            <MuiStack direction="row" spacing={0.5} alignItems="center" sx={{ flexGrow: 1, flexWrap: "wrap" }}>
              {navItems.map((item) => (
                <MuiButton
                  key={item.key}
                  component={RouterLink}
                  to={item.to}
                  color="inherit"
                  aria-current={pathname === item.to ? "page" : undefined}
                  sx={{ fontWeight: pathname === item.to ? 700 : 500 }}
                >
                  {item.label}
                </MuiButton>
              ))}

              {menus
                .filter((menu) => menu.items.length > 0)
                .map((menu) => (
                  <Box key={menu.key} component="span">
                    <MuiButton
                      color="inherit"
                      endIcon={<KeyboardArrowDownIcon />}
                      aria-haspopup="menu"
                      aria-expanded={openMenuKey === menu.key}
                      onClick={(event) => {
                        setAnchor(event.currentTarget);
                        setOpenMenuKey(menu.key);
                      }}
                    >
                      {menu.label}
                    </MuiButton>
                    <Menu
                      anchorEl={anchor}
                      open={openMenuKey === menu.key}
                      onClose={closeMenu}
                      slotProps={{ list: { "aria-label": menu.label } }}
                    >
                      {menu.items.map((item) => (
                        <MenuItem
                          key={item.key}
                          component={RouterLink}
                          to={item.to}
                          onClick={closeMenu}
                          selected={pathname === item.to}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                ))}
            </MuiStack>

            <MuiStack direction="row" spacing={1} alignItems="center">
              <ThemeModeToggle size="small" />
              <LanguageSwitcher />
              {connected ? (
                <>
                  {username && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
                      {connectedAsLabel ?? username}
                    </Typography>
                  )}
                  <Button variant="secondary" size="small" onClick={onSignOut}>
                    {signOutLabel}
                  </Button>
                </>
              ) : (
                <Button size="small" onClick={onSignIn}>
                  {signInLabel}
                </Button>
              )}
            </MuiStack>
          </Toolbar>
        </Container>
        <Divider />
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth={maxWidth}>{children}</Container>
      </Box>

      <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 3, mt: 4 }}>
        <Container maxWidth={maxWidth}>
          <MuiStack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <MuiStack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {footerLinks.map((link) =>
                link.href ? (
                  <Link
                    key={link.key}
                    href={link.href}
                    color="text.secondary"
                    underline="hover"
                    variant="body2"
                    target={link.external === false ? undefined : "_blank"}
                    rel={link.external === false ? undefined : "noopener noreferrer"}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <Tooltip key={link.key} title={link.pendingLabel ?? ""}>
                    <Typography
                      variant="body2"
                      color="text.disabled"
                      sx={{ textDecoration: "underline dotted", cursor: "help" }}
                    >
                      {link.label}
                      {link.pendingLabel ? ` — ${link.pendingLabel}` : ""}
                    </Typography>
                  </Tooltip>
                ),
              )}
            </MuiStack>
            {footerNote && (
              <Typography variant="body2" color="text.secondary">
                {footerNote}
              </Typography>
            )}
          </MuiStack>
        </Container>
      </Box>
    </Box>
  );
}
