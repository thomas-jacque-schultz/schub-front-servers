import CodeIcon from "@mui/icons-material/Code";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/EditOutlined";
import EmailIcon from "@mui/icons-material/AlternateEmail";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import HelpIcon from "@mui/icons-material/HelpOutline";
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
import StraightenIcon from "@mui/icons-material/Straighten";
import TranslateIcon from "@mui/icons-material/Translate";
import WorkIcon from "@mui/icons-material/WorkOutline";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassIcon from "@mui/icons-material/HourglassEmpty";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import GestureIcon from "@mui/icons-material/Gesture";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweepOutlined";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import NearMeIcon from "@mui/icons-material/NearMe";
import LayersIcon from "@mui/icons-material/Layers";
import { createSvgIcon } from "@mui/material/utils";

const CrownIcon = createSvgIcon(
  <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7zm2.7 14h12.6v-1.5H5.7V21z" />,
  "Crown",
);

const EraserIcon = createSvgIcon(
  <path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 0 1-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0M4.22 15.58l3.54 3.53c.78.79 2.04.79 2.83 0l3.53-3.53l-4.95-4.95l-4.95 4.95Z" />,
  "Eraser",
);

// Répertoire fermé : ajouter une icône ici plutôt qu'importer @mui/icons-material ailleurs.
const ICONS = {
  add: AddIcon,
  arrow: CallMadeIcon,
  back: ArrowBackIcon,
  chevron: ChevronRightIcon,
  clearAll: DeleteSweepIcon,
  code: CodeIcon,
  copy: ContentCopyIcon,
  crown: CrownIcon,
  cursor: NearMeIcon,
  delete: DeleteOutlineIcon,
  done: CheckCircleIcon,
  edit: EditIcon,
  ellipse: PanoramaFishEyeIcon,
  email: EmailIcon,
  eraser: EraserIcon,
  expand: ExpandMoreIcon,
  external: LaunchIcon,
  fullscreen: FullscreenIcon,
  fullscreenExit: FullscreenExitIcon,
  heart: FavoriteIcon,
  help: HelpIcon,
  infrastructure: HubIcon,
  languages: TranslateIcon,
  layers: LayersIcon,
  memory: MemoryIcon,
  pause: PauseIcon,
  pen: GestureIcon,
  pending: HourglassIcon,
  place: AddLocationAltIcon,
  play: PlayArrowIcon,
  rectangle: CropSquareIcon,
  refresh: RefreshIcon,
  ruler: StraightenIcon,
  school: SchoolIcon,
  science: ScienceIcon,
  send: SendIcon,
  storage: StorageIcon,
  todo: RadioButtonUncheckedIcon,
  undo: UndoIcon,
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
