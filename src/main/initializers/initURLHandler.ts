import { shell } from 'electron';
import { ipcMain as ipc } from 'electron';
import { IPC_MESSAGES, SEARCH_URLS } from '../../constants';

const {
  IPC_SYS_REVEAL_IN_FINDER,
  IPC_SYS_OPEN_URL
} = IPC_MESSAGES;

const openLink = function openLink(base: string, queryTerm: string): void {
  let link = base;
  if (queryTerm) {
    link += encodeURIComponent(queryTerm);
  }
  shell.openExternal(link);
};

export default function initURLHandler(): void {
  ipc.on(IPC_SYS_REVEAL_IN_FINDER, (_event, path) => {
    shell.showItemInFolder(path);
  });
  ipc.on(IPC_SYS_OPEN_URL, (_event, url: SEARCH_URLS, query: string) => {
    openLink(url, query);
  });
}
