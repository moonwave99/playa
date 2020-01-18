import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faList,
  faPlus,
  faPlay,
  faPause,
  faStepBackward,
  faStepForward,
  faFileAudio,
  faVolumeUp,
  faThList,
  faListAlt
} from '@fortawesome/free-solid-svg-icons';

export default function initFontAwesome(): void {
  library.add(
    faList,
    faPlus,
    faPlay,
    faPause,
    faStepBackward,
    faStepForward,    
    faFileAudio,
    faVolumeUp,
    faThList,
    faListAlt
  );
}
