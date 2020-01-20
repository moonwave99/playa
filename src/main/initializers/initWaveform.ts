import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import sha1 from 'sha1';
import { saveData } from '../saveData';
import { FileSystemError } from '../../errrors';

import { WAVEFORM_PEAKS_COUNT, IPC_MESSAGES, COLORS } from '../../constants';

const {
  IPC_WAVEFORM_SAVE_REQUEST,
  IPC_WAVEFORM_GET_BASE_PATH
} = IPC_MESSAGES;

function renderWaveformSVG(pathContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="waveform" viewBox="0 -1 ${WAVEFORM_PEAKS_COUNT} 2" preserveAspectRatio="none">
  <g>
    <path stroke="${COLORS.MAIN_COLOR}" d="${pathContent}"/>
  </g>
</svg>`;
}

export default function initWaveform(userDataPath: string): void {
  const waveformBasePath = Path.join(userDataPath, 'waveforms');
  ipc.handle(IPC_WAVEFORM_SAVE_REQUEST, async (_event, trackId: string, content: string) => {
    const targetPath = Path.join(waveformBasePath, `${sha1(trackId)}.svg`);
    try {
      return await saveData(renderWaveformSVG(content), targetPath, 'utf8');
    } catch (error) {
      if (error instanceof FileSystemError) {
        console.log(`[Waveform] could not save waveform for ${trackId}`);
      }
    }
  });
  ipc.handle(IPC_WAVEFORM_GET_BASE_PATH, async () => waveformBasePath);
}
