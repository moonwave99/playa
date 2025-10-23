import type { GroupWithArtists, MenuParams } from "@/types/types";
import { buildMenu, getDeleteEntry } from "../menu";

export const groupMenu =
  ({ controllers, openModal }: MenuParams) =>
  (group: GroupWithArtists) => {
    buildMenu([
      getDeleteEntry({
        title: group.title,
        deleteFn: () => controllers.group.deleteGroup(group.id),
        queryKeys: [["groups"], ["groups", group.id]],
      }),
      { type: "separator" },
      {
        label: "Edit Group",
        click: () => openModal("editGroup", { group }),
      },
    ]);
    return true;
  };
