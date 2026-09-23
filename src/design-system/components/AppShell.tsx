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
import { backdropSx, gridOverlaySx } from "../theme";
import { Button } from "./Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeModeToggle } from "./ThemeModeToggle";

export interface AppShellNavItem {
  key: string;
  label: string;
  to: string;
  muted?: boolean;
  hint?: string;
}

export interface AppShellMenu {
  key: string;
  label: string;
  items: AppShellNavItem[];
}

export type AppShellNavEntry = AppShellNavItem | AppShellMenu;

const estUnMenu = (entry: AppShellNavEntry): entry is AppShellMenu => "items" in entry;

export interface AppShellFooterLink {
  key: string;
  label: string;
  to?: string;
  href?: string | null;
  pendingLabel?: string;
  external?: boolean;
  /** Dans la couleur d'accent. Deux liens au plus : au-delà, plus rien ne ressort. */
  accent?: boolean;
}

export interface AppShellProps {
  brand: string;
  brandTo: string;
  brandTagline?: string;
  /** Entrées et menus déroulants, dans l'ordre d'affichage. */
  navItems?: AppShellNavEntry[];
  connected: boolean;
  username?: string | null;
  signInLabel: string;
  signOutLabel: string;
  connectedAsLabel?: string;
  onSignIn: () => void;
  onSignOut: () => void;
  footerLinks: AppShellFooterLink[];
  footerNote?: ReactNode;
  maxWidth?: "md" | "lg" | "xl";
  children: ReactNode;
}

export function AppShell({
  brand,
  brandTo,
  brandTagline,
  navItems = [],
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
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        ...backdropSx.page,
        "&::before": gridOverlaySx,
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth={maxWidth}>
          <Toolbar disableGutters sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
            <MuiStack
              component={RouterLink}
              to={brandTo}
              spacing={0}
              sx={{ textDecoration: "none", color: "inherit", mr: 2 }}
            >
              <MuiStack direction="row" spacing={0.75} alignItems="center">
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
                >
                  {brand}
                </Typography>
                {/* Le seul signe graphique de la marque. Il est décoratif : rien à annoncer. */}
                <Box
                  aria-hidden
                  sx={{ width: 7, height: 15, bgcolor: "primary.main", flexShrink: 0 }}
                />
              </MuiStack>
              {brandTagline && (
                <Typography variant="caption" color="text.secondary">
                  {brandTagline}
                </Typography>
              )}
            </MuiStack>

            <MuiStack direction="row" spacing={0.5} alignItems="center" sx={{ flexGrow: 1, flexWrap: "wrap" }}>
              {navItems.map((entry) => {
                if (!estUnMenu(entry)) {
                  const bouton = (
                    <MuiButton
                      component={RouterLink}
                      to={entry.to}
                      color="inherit"
                      aria-current={pathname === entry.to ? "page" : undefined}
                      aria-label={entry.hint ? `${entry.label} — ${entry.hint}` : undefined}
                      sx={{
                        fontWeight: pathname === entry.to ? 700 : 500,
                        color: entry.muted ? "text.disabled" : undefined,
                      }}
                    >
                      {entry.label}
                    </MuiButton>
                  );
                  return entry.hint ? (
                    <Tooltip key={entry.key} title={entry.hint}>
                      <Box component="span">{bouton}</Box>
                    </Tooltip>
                  ) : (
                    <Box key={entry.key} component="span">
                      {bouton}
                    </Box>
                  );
                }

                if (entry.items.length === 0) {
                  return null;
                }
                const courant = entry.items.some((item) => pathname.startsWith(item.to));
                return (
                  <Box key={entry.key} component="span">
                    <MuiButton
                      color="inherit"
                      endIcon={<KeyboardArrowDownIcon />}
                      aria-haspopup="menu"
                      aria-expanded={openMenuKey === entry.key}
                      sx={{ fontWeight: courant ? 700 : 500 }}
                      onClick={(event) => {
                        setAnchor(event.currentTarget);
                        setOpenMenuKey(entry.key);
                      }}
                    >
                      {entry.label}
                    </MuiButton>
                    <Menu
                      anchorEl={anchor}
                      open={openMenuKey === entry.key}
                      onClose={closeMenu}
                      slotProps={{ list: { "aria-label": entry.label } }}
                    >
                      {entry.items.map((item) => (
                        <MenuItem
                          key={item.key}
                          component={RouterLink}
                          to={item.to}
                          onClick={closeMenu}
                          selected={pathname === item.to}
                          aria-label={item.hint ? `${item.label} — ${item.hint}` : undefined}
                          title={item.hint}
                          sx={item.muted ? { color: "text.disabled" } : undefined}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                );
              })}
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

      <Box component="main" sx={{ position: "relative", flexGrow: 1, py: { xs: 3, md: 4 } }}>
        <Container maxWidth={maxWidth}>{children}</Container>
      </Box>

      <Box component="footer" sx={{ position: "relative", borderTop: 1, borderColor: "divider", py: 3, mt: 4 }}>
        <Container maxWidth={maxWidth}>
          <MuiStack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <MuiStack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
              {[...footerLinks].sort((a, b) => Number(Boolean(b.accent)) - Number(Boolean(a.accent))).map((link) =>
                link.to ? (
                  <Link
                    key={link.key}
                    component={RouterLink}
                    to={link.to}
                    color={link.accent ? "primary.main" : "text.secondary"}
                    underline="hover"
                    variant="body2"
                    sx={link.accent ? { fontWeight: 700 } : undefined}
                  >
                    {link.label}
                  </Link>
                ) : link.href ? (
                  <Link
                    key={link.key}
                    href={link.href}
                    color={link.accent ? "primary.main" : "text.secondary"}
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
