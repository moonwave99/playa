import { ipcMain as ipc } from 'electron';
import * as Path from 'path';
import * as fs from 'fs-extra';
import sha1 from 'sha1';
import { saveData } from '../lib/saveData';
import log, { LogContext, LogLevel } from '../lib/logger';
import { FileSystemError } from '../../errors';

import { WAVEFORM_RESOLUTION, IPC_MESSAGES, COLORS } from '../../constants';

const {
  IPC_WAVEFORM_SAVE_REQUEST,
  IPC_WAVEFORM_GET_BASE_PATH
} = IPC_MESSAGES;

function renderWaveformSVG(pathContent: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="waveform" viewBox="0 -1 ${WAVEFORM_RESOLUTION} 2" preserveAspectRatio="none">
  <g>
    <path stroke="${COLORS.MAIN_COLOR}" d="${pathContent}"/>
  </g>
</svg>`;
}

export default async function initWaveform(userDataPath: string): Promise<void> {
  const waveformBasePath = Path.join(userDataPath, 'waveforms');
  await fs.ensureDir(waveformBasePath);
  ipc.handle(IPC_WAVEFORM_SAVE_REQUEST, async (_event, trackId: string, content: string) => {
    const targetPath = Path.join(waveformBasePath, `${sha1(trackId)}.svg`);
    try {
      await saveData(renderWaveformSVG(content), targetPath, 'utf8');
      return targetPath;
    } catch (error) {
      if (error instanceof FileSystemError) {
        log({
          context: LogContext.Waveform,
          level: LogLevel.Warning,
          message: `Could not save waveform for ${trackId}`
        }, content);
      }
    }
  });
  ipc.handle(IPC_WAVEFORM_GET_BASE_PATH, async () => waveformBasePath);
}
