import type { CollectionWithReleases, MenuParams } from "@/types/types";
import { buildMenu, getDeleteEntry } from "./menu";

export const collectionMenu =
  ({ controllers, send }: MenuParams) =>
  (collection: CollectionWithReleases) => {
    buildMenu([
      getDeleteEntry({
        title: collection.title,
        deleteFn: () => controllers.collection.deleteCollection(collection.id),
        queryKeys: [["collections"], ["collections", collection.id]],
      }),
      { type: "separator" },
      {
        label: "Refresh contents for all Releases in this Collection",
        click: () => controllers.importFolders.refreshEntityRelease(collection),
      },
      {
        label: "Edit Collection",
        click: () => send("openEditCollectionDialog", collection),
      },
    ]);
    return true;
  };
