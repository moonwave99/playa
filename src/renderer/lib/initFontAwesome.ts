import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faList,
  faPlus,
  faFileAudio
} from '@fortawesome/free-solid-svg-icons';

export default function initFontAwesome(): void {
  library.add(
    faList,
    faPlus,
    faFileAudio
  );
}
