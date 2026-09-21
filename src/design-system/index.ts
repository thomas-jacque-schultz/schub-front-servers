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

export { Alert } from "./components/Alert";
export type { AlertProps, AlertSeverity } from "./components/Alert";
export { AppShell } from "./components/AppShell";
export type {
  AppShellFooterLink,
  AppShellMenu,
  AppShellNavItem,
  AppShellProps,
} from "./components/AppShell";
export { Avatar } from "./components/Avatar";
export type { AvatarProps } from "./components/Avatar";
export { Button } from "./components/Button";
export type {
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./components/Button";
export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";
export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";
export { ChampionIcon } from "./components/ChampionIcon";
export type { ChampionIconProps } from "./components/ChampionIcon";
export { Chip } from "./components/Chip";
export type { ChipProps, ChipTone } from "./components/Chip";
export { ChoiceList } from "./components/ChoiceList";
export type {
  ChoiceListOption,
  ChoiceListProps,
} from "./components/ChoiceList";
export { Columns } from "./components/Columns";
export type { ColumnsProps } from "./components/Columns";
export { DataTable } from "./components/DataTable";
export type { DataTableColumn, DataTableProps } from "./components/DataTable";
export { Dialog } from "./components/Dialog";
export type { DialogProps } from "./components/Dialog";
export { Disclosure } from "./components/Disclosure";
export type { DisclosureProps } from "./components/Disclosure";
export { Divider } from "./components/Divider";
export type { DividerProps } from "./components/Divider";
export { DiscordIcon } from "./components/DiscordIcon";
export type { DiscordIconProps } from "./components/DiscordIcon";
export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";
export { HoneypotField } from "./components/HoneypotField";
export type { HoneypotFieldProps } from "./components/HoneypotField";
export { Icon, ICON_NAMES } from "./components/Icon";
export type { IconName, IconProps } from "./components/Icon";
export { IconButton } from "./components/IconButton";
export type { IconButtonProps } from "./components/IconButton";
export { LanguageSwitcher } from "./components/LanguageSwitcher";
export { Link } from "./components/Link";
export type { LinkProps } from "./components/Link";
export { MultiSelect } from "./components/MultiSelect";
export type {
  MultiSelectOption,
  MultiSelectProps,
} from "./components/MultiSelect";
export { PageBackdrop } from "./components/PageBackdrop";
export type { PageBackdropProps } from "./components/PageBackdrop";
export { PageHeader } from "./components/PageHeader";
export type { PageHeaderProps } from "./components/PageHeader";
export { ProgressBar } from "./components/ProgressBar";
export type { ProgressBarProps } from "./components/ProgressBar";
export { SelectField } from "./components/SelectField";
export type { SelectFieldProps, SelectOption } from "./components/SelectField";
export { MeterBar } from "./components/MeterBar";
export type { MeterBarProps } from "./components/MeterBar";
export { Spinner } from "./components/Spinner";
export type { SpinnerProps } from "./components/Spinner";
export { TaskList } from "./components/TaskList";
export type { TaskListItem, TaskListProps, TaskState } from "./components/TaskList";
export { Stack } from "./components/Stack";
export type {
  StackAlign,
  StackDirection,
  StackJustify,
  StackProps,
} from "./components/Stack";
export { StatTile } from "./components/StatTile";
export type { StatTileProps } from "./components/StatTile";
export { StatusChip } from "./components/StatusChip";
export type { StatusChipProps } from "./components/StatusChip";
export { Switch } from "./components/Switch";
export type { SwitchProps } from "./components/Switch";
export { Tabs } from "./components/Tabs";
export type { TabItem, TabsProps } from "./components/Tabs";
export { Text } from "./components/Text";
export type { TextProps, TextTone, TextVariant } from "./components/Text";
export { TextField } from "./components/TextField";
export type { TextFieldProps } from "./components/TextField";
export { ThemeModeToggle } from "./components/ThemeModeToggle";
export { TrendChart } from "./components/TrendChart";
export type { TrendChartProps, TrendPoint } from "./components/TrendChart";
export { Toast } from "./components/Toast";
export type { ToastProps } from "./components/Toast";
export { Tooltip } from "./components/Tooltip";
export type { TooltipProps } from "./components/Tooltip";
