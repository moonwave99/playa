import type { GroupWithArtists, MenuParams } from "@/types/types";
import { buildMenu } from "../menu";

export const groupMenu =
  ({ controllers, openModal }: MenuParams) =>
  (group: GroupWithArtists) => {
    buildMenu([
      {
        label: "Delete Group",
        click: () => controllers.group.deleteGroup(group.id),
      },
      { type: "separator" },
      {
        label: "Edit Group",
        click: () => openModal("editGroup", { group }),
      },
    ]);
    return true;
  };
