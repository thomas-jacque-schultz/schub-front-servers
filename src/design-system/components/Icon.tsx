import CodeIcon from "@mui/icons-material/Code";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/AlternateEmail";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HubIcon from "@mui/icons-material/Hub";
import LaunchIcon from "@mui/icons-material/Launch";
import MemoryIcon from "@mui/icons-material/Memory";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";
import SendIcon from "@mui/icons-material/Send";
import StorageIcon from "@mui/icons-material/Storage";
import TranslateIcon from "@mui/icons-material/Translate";
import WorkIcon from "@mui/icons-material/WorkOutline";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassIcon from "@mui/icons-material/HourglassEmpty";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// Répertoire fermé : ajouter une icône ici plutôt qu'importer @mui/icons-material ailleurs.
const ICONS = {
  add: AddIcon,
  chevron: ChevronRightIcon,
  code: CodeIcon,
  delete: DeleteOutlineIcon,
  done: CheckCircleIcon,
  email: EmailIcon,
  expand: ExpandMoreIcon,
  external: LaunchIcon,
  infrastructure: HubIcon,
  languages: TranslateIcon,
  memory: MemoryIcon,
  pause: PauseIcon,
  pending: HourglassIcon,
  play: PlayArrowIcon,
  refresh: RefreshIcon,
  school: SchoolIcon,
  send: SendIcon,
  storage: StorageIcon,
  todo: RadioButtonUncheckedIcon,
  work: WorkIcon,
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: "small" | "medium";
  label?: string;
}

export function Icon({ name, size = "medium", label }: IconProps) {
  const Component = ICONS[name];
  return (
    <Component
      fontSize={size}
      titleAccess={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
    />
  );
}

export const ICON_NAMES = Object.keys(ICONS) as IconName[];
