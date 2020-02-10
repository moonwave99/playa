import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faList,
  faPlus,
  faPlay,
  faPause,
  faStepBackward,
  faStepForward,
  faPlayCircle,
  faFileAudio,
  faVolumeOff,
  faVolumeDown,
  faVolumeUp,
  faMusic,
  faThList,
  faListAlt,
  faSearch,
  faFileImport,
  faMinusCircle,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';

export default function initFontAwesome(): void {
  library.add(
    faList,
    faPlus,
    faPlay,
    faPause,
    faStepBackward,
    faStepForward,
    faPlayCircle,
    faFileAudio,
    faVolumeOff,
    faVolumeDown,
    faVolumeUp,
    faMusic,
    faThList,
    faListAlt,
    faSearch,
    faFileImport,
    faMinusCircle,
    faFolderOpen
  );
}
