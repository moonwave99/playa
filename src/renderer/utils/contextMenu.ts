import { remote, ipcRenderer as ipc } from 'electron';
const { Menu, MenuItem } = remote;

export const RESULT_LIST_ITEM = 'RESULT_LIST_ITEM';

export const ContextMenuTypes = RESULT_LIST_ITEM;

interface HasPath {
  path: string;
}

export interface ContextMenuOptions {
  type: typeof ContextMenuTypes;
  context: HasPath;
}

export default function openContextMenu(options: ContextMenuOptions): void {
  const menu = new Menu();
  switch (options.type) {
    case RESULT_LIST_ITEM:
      menu.append(new MenuItem({
        label: 'Show in Finder',
        click(): void {
          ipc.send('reveal-in-finder', options.context);
        },
      }));
      break;
  }
  menu.popup({ window: remote.getCurrentWindow() });
}
