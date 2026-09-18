/**
 * La porte d'entrée du design system — et **la seule porte vers MUI**.
 *
 * <p>Une règle ESLint (`no-restricted-imports`, voir `eslint.config.js`) interdit d'importer
 * `@mui/material` et `@mui/icons-material` ailleurs que dans `src/design-system/`. Un écran qui a
 * besoin d'un composant absent d'ici l'ajoute ici, avec sa story — il ne contourne pas.</p>
 */
export { AppThemeProvider } from "./AppThemeProvider";
export { appTheme, backdropSx, THEME_MODE_STORAGE_KEY } from "./theme";
export * from "./tokens";

export { Button } from "./components/Button";
export type { ButtonProps, ButtonSize, ButtonVariant } from "./components/Button";
export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";
export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";
export { LanguageSwitcher } from "./components/LanguageSwitcher";
export { PageBackdrop } from "./components/PageBackdrop";
export type { PageBackdropProps } from "./components/PageBackdrop";
export { PageHeader } from "./components/PageHeader";
export type { PageHeaderProps } from "./components/PageHeader";
export { StatusChip } from "./components/StatusChip";
export type { StatusChipProps } from "./components/StatusChip";
export { TextField } from "./components/TextField";
export type { TextFieldProps } from "./components/TextField";
export { ThemeModeToggle } from "./components/ThemeModeToggle";
