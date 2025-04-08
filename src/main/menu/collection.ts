import type { CollectionWithReleases } from "@/types/types";
import { buildMenu, getDeleteEntry } from "./menu";
import { send, type Controllers } from "../init";

export const collectionMenu = (controllers: Controllers) => ({ id, title, releases }: CollectionWithReleases) => {
  buildMenu([
    getDeleteEntry({
      title,
      deleteFn: () => controllers.collection.deleteCollection(id),
      queryKeys: [['collections'], ['collections', id]]
    }),
    { type: 'separator' },
    {
      label: 'Refresh contents for all Releases in this Collection',
      click: async () => {
        await Promise.all(releases.map(({ id }) => controllers.release.refreshReleaseContents(id)));
        send('mutate', ['collections', id]);
      }
    }
  ]);
  return true;
}