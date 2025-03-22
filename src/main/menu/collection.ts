import { BrowserWindow } from 'electron';
import type { CollectionWithReleases } from "@/types/types";
import { refreshReleaseContents } from "../system";
import { deleteCollection } from "../db/collection";
import { buildMenu, getDeleteEntry } from "./menu";

export const collectionMenu = ({ id, title, releases }: CollectionWithReleases) => {
  buildMenu([
    getDeleteEntry({
      title,
      deleteFn: () => deleteCollection(id),
      queryKeys: [['collections'], ['collections', id]]
    }),
    { type: 'separator' },
    {
      label: 'Refresh contents for all Releases in this Collection',
      click: async () => {
        await Promise.all(releases.map(({ id }) => refreshReleaseContents(id)));
        BrowserWindow.getAllWindows()[0].webContents.send('mutate', ['collections', id]);
      }
    }
  ]);
  return true;
}