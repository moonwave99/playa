import type { CollectionWithReleases, MenuParams } from "@/types/types";
import { buildMenu } from "../menu";

export const collectionMenu =
  ({ controllers, openModal }: MenuParams) =>
  (collection: CollectionWithReleases) => {
    buildMenu([
      {
        label: "Delete Collection",
        click: () => controllers.collection.deleteCollection(collection.id),
      },
      { type: "separator" },
      {
        label: "Refresh contents for all Releases in this Collection",
        click: () => controllers.importFolders.refreshEntityRelease(collection),
      },
      {
        label: "Edit Collection",
        click: () => openModal("editCollection", { collection }),
      },
    ]);
    return true;
  };
