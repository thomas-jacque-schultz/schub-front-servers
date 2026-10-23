import CodeIcon from "@mui/icons-material/Code";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import EmailIcon from "@mui/icons-material/AlternateEmail";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import HubIcon from "@mui/icons-material/Hub";
import LaunchIcon from "@mui/icons-material/Launch";
import MemoryIcon from "@mui/icons-material/Memory";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchoolIcon from "@mui/icons-material/School";
import ScienceIcon from "@mui/icons-material/ScienceOutlined";
import SendIcon from "@mui/icons-material/Send";
import StorageIcon from "@mui/icons-material/Storage";
import TranslateIcon from "@mui/icons-material/Translate";
import WorkIcon from "@mui/icons-material/WorkOutline";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassIcon from "@mui/icons-material/HourglassEmpty";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { createSvgIcon } from "@mui/material/utils";

const CrownIcon = createSvgIcon(
  <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7zm2.7 14h12.6v-1.5H5.7V21z" />,
  "Crown",
);

// Répertoire fermé : ajouter une icône ici plutôt qu'importer @mui/icons-material ailleurs.
const ICONS = {
  add: AddIcon,
  chevron: ChevronRightIcon,
  code: CodeIcon,
  crown: CrownIcon,
  delete: DeleteOutlineIcon,
  done: CheckCircleIcon,
  edit: EditIcon,
  email: EmailIcon,
  expand: ExpandMoreIcon,
  external: LaunchIcon,
  heart: FavoriteIcon,
  infrastructure: HubIcon,
  languages: TranslateIcon,
  memory: MemoryIcon,
  pause: PauseIcon,
  pending: HourglassIcon,
  play: PlayArrowIcon,
  refresh: RefreshIcon,
  school: SchoolIcon,
  science: ScienceIcon,
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
